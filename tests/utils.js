export const mochaAsync = (fn) => {
    return done => {
        fn.call().then(done, err => {
            done(err);
        });
    };
};

export const detectValidationErrors = (res) => {
    if(res.message == 'Validation errors'){
        console.log(res.errors[0]);
        return true;
    }else{
        return false;
    }
}

// run given function after a delay of x milliseconds
export const runAfter = async (func, delayMs) => {
	return new Promise( async (resolve, reject) => {
		setTimeout(async () => {
			try {
				let res = await func();
				resolve(res);
			} catch (err) {
				reject(err);
			}
		}, delayMs);
	})
}