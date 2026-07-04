import { authRouter } from "./auth-router";
import { mitrasRouter } from "./mitras-router";
import { transactionsRouter } from "./transactions-router";
import { paymentsRouter } from "./payments-router";
import { dashboardRouter } from "./dashboard-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  mitra: mitrasRouter,
  transaction: transactionsRouter,
  payment: paymentsRouter,
  dashboard: dashboardRouter,
});

export type AppRouter = typeof appRouter;
