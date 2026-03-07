export function executeAutofill(cred: any) {
    const passwordInputs = Array.from(document.querySelectorAll("input[type='password']")) as HTMLInputElement[];
    const textInputs = Array.from(document.querySelectorAll("input[type='text'], input[type='email']")) as HTMLInputElement[];

    const firstPasswordInput = passwordInputs.length > 0 ? passwordInputs[0] : null;
    let usernameInput = textInputs.length > 0 ? textInputs[0] : null;

    if (firstPasswordInput) {
        const form = firstPasswordInput.closest('form');
        if (form) {
            const formTextInputs = Array.from(form.querySelectorAll("input[type='text'], input[type='email']")) as HTMLInputElement[];
            if (formTextInputs.length > 0) {
                usernameInput = formTextInputs[0];
            }
        }
    }

    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;

    if (cred.uid && usernameInput) {
        if (nativeInputValueSetter) {
            nativeInputValueSetter.call(usernameInput, cred.uid);
            usernameInput.dispatchEvent(new Event('input', { bubbles: true }));
        } else {
            usernameInput.value = cred.uid;
        }
    }

    if (cred.password && firstPasswordInput) {
        if (nativeInputValueSetter) {
            nativeInputValueSetter.call(firstPasswordInput, cred.password);
            firstPasswordInput.dispatchEvent(new Event('input', { bubbles: true }));
        } else {
            firstPasswordInput.value = cred.password;
        }
    }
}
