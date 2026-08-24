/**
 * 简单的 router 注册点：占位，方便后续把具体业务 router 挂载进来
 */
const routers: Record<string, any> = {};

export function registerRouter(name: string, router: any) {
  routers[name] = router;
}

export function getRouter(name: string) {
  return routers[name];
}

export const appRouter = {
  registerRouter,
  getRouter,
};

export default appRouter;
