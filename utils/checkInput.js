export function identifyInput(input) {

    if (isEmptyOrSpace(input)) {
        return 'unknown'
        
    } else {
        // Regular expression patterns for email and username
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const usernamePattern = /^[a-zA-Z0-9_]+$/;

        if (emailPattern.test(input)) {
            return 'email';
        } else if (usernamePattern.test(input)) {
            return 'username';
        } else {
            return 'unknown';
        }
    }
};

export function isEmptyOrSpace(input) {
    if (input === undefined) {
        return true;
    }
    const trimmed = input.trim();
    return trimmed.length === 0;
};