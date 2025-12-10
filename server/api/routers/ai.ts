/**
 * AI Router
 * Handles AI-powered content generation using Google Gemini
 */

import { router, protectedProcedure } from "../../_core/trpc";
import { z } from "zod";
import { getDb } from "../../db";
import { reportRequests, products, companySettings } from "../../../drizzle/schema";
import { eq } from "drizzle-orm";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const aiRouter = router({
  /**
   * Generate proposal content with AI
   * Fetches job, product, and company data, then generates AI content
   */
  generateProposalContent: protectedProcedure
    .input(z.object({
      jobId: z.number(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Fetch job data
      const [job] = await db
        .select()
        .from(reportRequests)
        .where(eq(reportRequests.id, input.jobId));

      if (!job) throw new Error("Job not found");

      // Fetch company settings
      const [company] = await db
        .select()
        .from(companySettings)
        .where(eq(companySettings.id, 1));

      // Fetch selected product if available
      let product = null;
      if (job.selectedProductId) {
        const [selectedProduct] = await db
          .select()
          .from(products)
          .where(eq(products.id, job.selectedProductId));
        product = selectedProduct || null;
      }

      // Generate AI content using Gemini
      let aiContent = {
        scope: "",
        closing: ""
      };

      try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // Construct prompt based on whether product is selected
        let prompt = "";
        if (product) {
          prompt = `You are a professional roofing estimator writing a proposal. Write a compelling "Scope of Work" section (2-3 paragraphs) for a roof replacement project using ${product.productName} shingles in ${product.color} color by ${product.manufacturer}. 

Key product features to highlight:
- Wind Rating: ${product.windRating}
- Warranty: ${product.warrantyInfo}
- Description: ${product.description}

The scope should be professional, detailed, and emphasize quality and protection. Do not include pricing.

Then write a warm, professional closing statement (1 paragraph) that thanks the customer and encourages them to reach out with questions.

Format your response as:
SCOPE:
[scope of work here]

CLOSING:
[closing statement here]`;
        } else {
          prompt = `You are a professional roofing estimator writing a proposal. Write a compelling "Scope of Work" section (2-3 paragraphs) for a roof replacement project using high-quality architectural shingles. 

The scope should be professional, detailed, and emphasize quality and protection. Do not include pricing or specific product names.

Then write a warm, professional closing statement (1 paragraph) that thanks the customer and encourages them to reach out with questions.

Format your response as:
SCOPE:
[scope of work here]

CLOSING:
[closing statement here]`;
        }

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Parse the response
        const scopeMatch = text.match(/SCOPE:\s*([\s\S]*?)(?=CLOSING:|$)/i);
        const closingMatch = text.match(/CLOSING:\s*([\s\S]*?)$/i);

        aiContent = {
          scope: scopeMatch ? scopeMatch[1].trim() : text,
          closing: closingMatch ? closingMatch[1].trim() : "Thank you for considering us for your roofing project. We look forward to working with you!"
        };
      } catch (error) {
        console.error("Gemini AI error:", error);
        // Fallback content if AI fails
        if (product) {
          aiContent = {
            scope: `This proposal outlines a complete roof replacement using ${product.productName} in ${product.color} by ${product.manufacturer}. These premium shingles offer ${product.windRating} wind resistance and come with ${product.warrantyInfo}. Our experienced team will remove your existing roof, install new underlayment, and professionally install your new shingle system to manufacturer specifications.`,
            closing: "Thank you for considering us for your roofing project. We look forward to working with you and protecting your home for years to come."
          };
        } else {
          aiContent = {
            scope: "This proposal outlines a complete roof replacement using high-quality architectural shingles. Our experienced team will remove your existing roof, install new underlayment, and professionally install your new shingle system to manufacturer specifications.",
            closing: "Thank you for considering us for your roofing project. We look forward to working with you."
          };
        }
      }

      return {
        job,
        company: company || null,
        product,
        aiContent
      };
    }),
});
