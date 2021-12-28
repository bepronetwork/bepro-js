export const mochaAsync = fn => done => {
  fn.call().then(done, err => {
    done(err);
  });
};

export const detectValidationErrors = res => {
  if (res.message === 'Validation errors') {
    // eslint-disable-next-line no-console
    console.log(res.errors[0]);
    return true;
  }
  return false;
};

// run given function after a delay of x milliseconds
export const runAfter = (func, delayMs) => new Promise((resolve, reject) => {
  setTimeout(async () => {
    try {
      const res = await func();
      resolve(res);
    }
    catch (err) {
      reject(err);
    }
  }, delayMs);
});
