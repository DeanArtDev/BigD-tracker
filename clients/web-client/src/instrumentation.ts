import { Instrumentation } from 'next';

export async function register() {
  console.log('==================== App Register ======================');
}

// Server global error handler
export const onRequestError: Instrumentation.onRequestError = async (err, request, context) => {
  console.error({
    err,
    request,
    context,
  });
};
