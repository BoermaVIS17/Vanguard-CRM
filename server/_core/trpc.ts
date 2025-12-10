import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";
import { logger } from "../lib/logger";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error, ctx }) {
    // Log all errors with context
    if (error.code === 'INTERNAL_SERVER_ERROR' || shape.data.httpStatus >= 500) {
      logger.error(
        `tRPC Error: ${error.message}`,
        error.cause || error,
        {
          requestId: ctx?.requestId,
          userId: ctx?.user?.id,
          code: error.code,
          path: shape.data.path,
        }
      );
    }
    
    return shape;
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

// Admin procedure - allows owner, admin, and office roles
export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || !['admin', 'owner', 'office'].includes(ctx.user.role)) {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);

// Owner/Office only procedure - for sensitive operations like material orders
export const ownerOfficeProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || !['owner', 'office', 'admin'].includes(ctx.user.role)) {
      throw new TRPCError({ 
        code: "FORBIDDEN", 
        message: "Only Owner and Office staff can perform this action" 
      });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);
