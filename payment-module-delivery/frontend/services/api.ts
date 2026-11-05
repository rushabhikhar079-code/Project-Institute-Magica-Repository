// Stub for the existing project's api module.
// The payment service imports `api` from "../../../services/api".
// In the preview, only mock functions are called — this stub exists so the import resolves.
// It is never invoked during preview.

const noop = async () => {
  throw new Error("Real API calls are not available in preview mode. Use mock functions.");
};

const apiStub = {
  get: noop,
  post: noop,
  put: noop,
  delete: noop,
  patch: noop,
  defaults: { headers: {} },
  interceptors: { request: { use: () => {} }, response: { use: () => {} } },
};

export default apiStub;
