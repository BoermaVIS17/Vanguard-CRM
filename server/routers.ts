import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { reportRequests, users, activities, documents } from "../drizzle/schema";
import { PRODUCTS, validatePromoCode } from "./products";
import { notifyOwner } from "./_core/notification";
import { sendSMSNotification } from "./sms";
import Stripe from "stripe";
import { ENV } from "./_core/env";
import { eq, desc, and, or, like, sql } from "drizzle-orm";

// Initialize Stripe
const stripe = new Stripe(ENV.stripeSecretKey || "", {
  apiVersion: "2025-11-17.clover",
});

// CRM Role check helper
const CRM_ROLES = ["owner", "admin", "office", "sales_rep", "project_manager"];

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // Report request procedures (public landing page)
  report: router({
    validatePromo: publicProcedure
      .input(z.object({ code: z.string() }))
      .mutation(({ input }) => {
        const result = validatePromoCode(input.code);
        return result;
      }),

    submit: publicProcedure
      .input(z.object({
        fullName: z.string().min(2),
        email: z.string().email(),
        phone: z.string().min(10),
        address: z.string().min(5),
        cityStateZip: z.string().min(5),
        roofAge: z.string().optional(),
        roofConcerns: z.string().optional(),
        handsOnInspection: z.boolean().optional(),
        promoCode: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const promoResult = input.promoCode ? validatePromoCode(input.promoCode) : { valid: false, discountPercent: 0, salesRep: undefined };
        const isFree = promoResult.valid && promoResult.discountPercent === 100;
        const salesRepAttribution = promoResult.salesRep || "Direct/No Code";
        const handsOnText = input.handsOnInspection ? "✅ YES - Requested" : "No";
        const concernsText = input.roofConcerns?.trim() || "None specified";

        if (isFree) {
          const [result] = await db.insert(reportRequests).values({
            fullName: input.fullName,
            email: input.email,
            phone: input.phone,
            address: input.address,
            cityStateZip: input.cityStateZip,
            roofAge: input.roofAge || null,
            roofConcerns: input.roofConcerns || null,
            handsOnInspection: input.handsOnInspection || false,
            promoCode: input.promoCode?.toUpperCase() || null,
            promoApplied: true,
            amountPaid: 0,
            status: "new_lead",
            salesRepCode: promoResult.salesRep || null,
            leadSource: "website",
          });

          await notifyOwner({
            title: input.handsOnInspection 
              ? "🏠🔧 New Storm Report Request (FREE + HANDS-ON)" 
              : "🏠 New Storm Report Request (FREE - Promo Code)",
            content: `**New Report Request Received**\n\n**Customer Details:**\n- Name: ${input.fullName}\n- Email: ${input.email}\n- Phone: ${input.phone}\n\n**Property:**\n- Address: ${input.address}\n- City/State/ZIP: ${input.cityStateZip}\n- Roof Age: ${input.roofAge || "Not specified"}\n\n**Roof Concerns:**\n${concernsText}\n\n**Hands-On Inspection:** ${handsOnText}\n\n**Payment:**\n- Promo Code: ${input.promoCode?.toUpperCase()}\n- Amount: $0.00 (Fee Waived)\n\n**📋 Sales Rep Attribution:** ${salesRepAttribution}\n\n**Status:** Pending Scheduling`.trim(),
          });

          await sendSMSNotification({
            customerName: input.fullName,
            customerPhone: input.phone,
            address: `${input.address}, ${input.cityStateZip}`,
            isPaid: false,
            promoCode: input.promoCode?.toUpperCase(),
            salesRep: salesRepAttribution,
          });

          return { success: true, requiresPayment: false, requestId: result.insertId };
        } else {
          const origin = ctx.req.headers.origin || "http://localhost:3000";
          
          const [result] = await db.insert(reportRequests).values({
            fullName: input.fullName,
            email: input.email,
            phone: input.phone,
            address: input.address,
            cityStateZip: input.cityStateZip,
            roofAge: input.roofAge || null,
            roofConcerns: input.roofConcerns || null,
            handsOnInspection: input.handsOnInspection || false,
            promoCode: input.promoCode?.toUpperCase() || null,
            promoApplied: false,
            amountPaid: 0,
            status: "new_lead",
            leadSource: "website",
          });

          const requestId = result.insertId;

          const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [{
              price_data: {
                currency: PRODUCTS.STORM_REPORT.currency,
                product_data: {
                  name: PRODUCTS.STORM_REPORT.name,
                  description: PRODUCTS.STORM_REPORT.description,
                },
                unit_amount: PRODUCTS.STORM_REPORT.priceInCents,
              },
              quantity: 1,
            }],
            mode: "payment",
            success_url: `${origin}/thank-you?success=true&request_id=${requestId}`,
            cancel_url: `${origin}/?cancelled=true`,
            customer_email: input.email,
            client_reference_id: requestId.toString(),
            metadata: {
              request_id: requestId.toString(),
              customer_name: input.fullName,
              customer_email: input.email,
              customer_phone: input.phone,
              address: input.address,
              city_state_zip: input.cityStateZip,
              hands_on_inspection: input.handsOnInspection ? "yes" : "no",
            },
          });

          await db.update(reportRequests)
            .set({ stripeCheckoutSessionId: session.id })
            .where(eq(reportRequests.id, requestId));

          return { success: true, requiresPayment: true, checkoutUrl: session.url, requestId };
        }
      }),
  }),

  // CRM procedures (protected - requires login)
  crm: router({
    // Dashboard stats
    getStats: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [totalLeads] = await db.select({ count: sql<number>`COUNT(*)` }).from(reportRequests);
      const [newLeads] = await db.select({ count: sql<number>`COUNT(*)` }).from(reportRequests).where(eq(reportRequests.status, "new_lead"));
      const [scheduledLeads] = await db.select({ count: sql<number>`COUNT(*)` }).from(reportRequests).where(or(eq(reportRequests.status, "appointment_set"), eq(reportRequests.status, "inspection_scheduled")));
      const [completedLeads] = await db.select({ count: sql<number>`COUNT(*)` }).from(reportRequests).where(eq(reportRequests.status, "closed_won"));
      const [totalRevenue] = await db.select({ sum: sql<number>`COALESCE(SUM(amountPaid), 0)` }).from(reportRequests);

      return {
        totalLeads: totalLeads?.count || 0,
        newLeads: newLeads?.count || 0,
        scheduledLeads: scheduledLeads?.count || 0,
        completedLeads: completedLeads?.count || 0,
        totalRevenue: (totalRevenue?.sum || 0) / 100,
      };
    }),

    // Get all leads with filtering
    getLeads: protectedProcedure
      .input(z.object({
        status: z.string().optional(),
        search: z.string().optional(),
        assignedTo: z.number().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      }).optional())
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        let query = db.select().from(reportRequests).orderBy(desc(reportRequests.createdAt));

        const leads = await query.limit(input?.limit || 50).offset(input?.offset || 0);
        return leads;
      }),

    // Get single lead by ID
    getLead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const [lead] = await db.select().from(reportRequests).where(eq(reportRequests.id, input.id));
        if (!lead) throw new Error("Lead not found");

        const leadActivities = await db.select().from(activities)
          .where(eq(activities.reportRequestId, input.id))
          .orderBy(desc(activities.createdAt));

        return { ...lead, activities: leadActivities };
      }),

    // Update lead
    updateLead: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.string().optional(),
        priority: z.string().optional(),
        assignedTo: z.number().optional(),
        internalNotes: z.string().optional(),
        scheduledDate: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const updateData: Record<string, unknown> = {};
        if (input.status) updateData.status = input.status;
        if (input.priority) updateData.priority = input.priority;
        if (input.assignedTo !== undefined) updateData.assignedTo = input.assignedTo;
        if (input.internalNotes !== undefined) updateData.internalNotes = input.internalNotes;
        if (input.scheduledDate) updateData.scheduledDate = new Date(input.scheduledDate);

        await db.update(reportRequests).set(updateData).where(eq(reportRequests.id, input.id));

        // Log activity
        if (input.status) {
          await db.insert(activities).values({
            reportRequestId: input.id,
            userId: ctx.user?.id,
            activityType: "status_change",
            description: `Status changed to ${input.status}`,
          });
        }

        return { success: true };
      }),

    // Add note to lead
    addNote: protectedProcedure
      .input(z.object({
        leadId: z.number(),
        note: z.string().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        await db.insert(activities).values({
          reportRequestId: input.leadId,
          userId: ctx.user?.id,
          activityType: "note_added",
          description: input.note,
        });

        return { success: true };
      }),

    // Get pipeline data (leads grouped by status)
    getPipeline: protectedProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const leads = await db.select().from(reportRequests).orderBy(desc(reportRequests.createdAt));

      const pipeline = {
        new_lead: leads.filter(l => l.status === "new_lead"),
        contacted: leads.filter(l => l.status === "contacted"),
        appointment_set: leads.filter(l => l.status === "appointment_set"),
        inspection_scheduled: leads.filter(l => l.status === "inspection_scheduled"),
        inspection_complete: leads.filter(l => l.status === "inspection_complete"),
        report_sent: leads.filter(l => l.status === "report_sent"),
        follow_up: leads.filter(l => l.status === "follow_up"),
        closed_won: leads.filter(l => l.status === "closed_won"),
        closed_lost: leads.filter(l => l.status === "closed_lost"),
      };

      return pipeline;
    }),

    // Get team members
    getTeam: protectedProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const team = await db.select().from(users).orderBy(users.name);
      return team;
    }),

    // Update team member role
    updateTeamMember: protectedProcedure
      .input(z.object({
        userId: z.number(),
        role: z.enum(["user", "admin", "owner", "office", "sales_rep", "project_manager"]),
        repCode: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Only owners/admins can update roles
        if (ctx.user?.role !== "owner" && ctx.user?.role !== "admin") {
          throw new Error("Unauthorized");
        }

        const updateData: Record<string, unknown> = { role: input.role };
        if (input.repCode !== undefined) updateData.repCode = input.repCode;
        if (input.isActive !== undefined) updateData.isActive = input.isActive;

        await db.update(users).set(updateData).where(eq(users.id, input.userId));
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
