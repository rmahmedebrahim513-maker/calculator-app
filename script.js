// Calculator logic with button and keyboard support
(() => {
    const display = document.getElementById('display_area');
    const buttons = document.querySelectorAll('#calculator_container button');

    let expression = '';
    let justEvaluated = false;

    const isOperator = (ch) => /[+\-*/]/.test(ch);

    function updateDisplay() {
        display.textContent = expression || '0';
    }

    function appendToken(token) {
        // Reset after evaluation if next input starts a new number
        if (justEvaluated && (/\d|\.|\(/.test(token))) {
            expression = '';
            justEvaluated = false;
        } else if (justEvaluated && isOperator(token)) {
            // continue calculation with result
            justEvaluated = false;
        }

        const last = expression.slice(-1);

        // Auto-insert implicit multiplication: number or ')' followed by '('
        if (token === '(' && (/[0-9)]/.test(last))) {
            expression += '*';
        }

        // Prevent starting with operator other than '-'
        if (expression.length === 0 && isOperator(token) && token !== '-') {
            updateDisplay();
            return;
        }

        // Replace consecutive operators (keep the newest)
        if (isOperator(token) && isOperator(last)) {
            expression = expression.slice(0, -1) + token;
            updateDisplay();
            return;
        }

        // Prevent multiple decimals in the current number segment
        if (token === '.') {
            const match = expression.match(/([0-9]*\.?[0-9]*)$/);
            if (match && match[0].includes('.')) {
                updateDisplay();
                return;
            }
            // If starting with '.', prepend leading zero
            if (expression === '' || isOperator(last) || last === '(') {
                expression += '0';
            }
        }

        // Basic parenthesis rules: avoid ")(" directly becoming ")(" → allow, engine handles it as multiplication
        expression += token;
        updateDisplay();
    }

    function clearAll() {
        expression = '';
        justEvaluated = false;
        updateDisplay();
    }

    function deleteOne() {
        if (justEvaluated) {
            // After result, DEL behaves like clear last digit of result
            justEvaluated = false;
        }
        expression = expression.slice(0, -1);
        updateDisplay();
    }

    function safeEvaluate() {
        if (!expression) return;
        // Validate allowed characters only
        const sanitized = expression.replace(/[^0-9+\-*/(). ]/g, '');
        if (sanitized !== expression) {
            flashError();
            return;
        }
        // Avoid trailing operator
        if (isOperator(expression.slice(-1))) {
            flashError();
            return;
        }
        try {
            // eslint-disable-next-line no-new-func
            const result = Function(`"use strict"; return (${sanitized})`)();
            if (typeof result !== 'number' || !isFinite(result)) {
                flashError();
                return;
            }
            expression = String(result);
            justEvaluated = true;
            updateDisplay();
        } catch (err) {
            flashError();
        }
    }

    function flashError() {
        // Briefly flash the display to indicate an error
        const original = display.style.boxShadow;
        display.style.boxShadow = 'inset 0 0 0 1px rgba(255,0,0,0.6)';
        setTimeout(() => {
            display.style.boxShadow = original;
        }, 200);
    }

    function handleInput(label) {
        switch (label) {
            case 'c':
            case 'C':
                clearAll();
                break;
            case 'DEL':
                deleteOne();
                break;
            case '=':
                safeEvaluate();
                break;
            default:
                appendToken(label);
        }
    }

    function flashButtonByLabel(label) {
        const btn = [...buttons].find(b => b.textContent.trim() === label);
        if (!btn) return;
        btn.classList.add('pressed');
        setTimeout(() => btn.classList.remove('pressed'), 140);
    }

    // Wire button clicks
    buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
            const label = btn.textContent.trim();
            handleInput(label);
        });
    });

    // Keyboard support
    document.addEventListener('keydown', (e) => {
        const key = e.key;
        // Map special keys
        let label = '';
        if (/^[0-9]$/.test(key)) label = key;
        else if (['+', '-', '*', '/', '(', ')', '.'].includes(key)) label = key;
        else if (key === 'Enter' || key === '=') label = '=';
        else if (key === 'Backspace') label = 'DEL';
        else if (key === 'Escape') label = 'c';
        else return; // ignore others

        e.preventDefault();
        handleInput(label);
        flashButtonByLabel(label);
    });

    // Initialize display
    updateDisplay();
})();


