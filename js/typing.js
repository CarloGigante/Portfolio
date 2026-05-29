const textArray = ["Web Developer", "Web Designer", "IT Support", "IT Specialist"];
const typingDelay = 100;
const erasingDelay = 50;
const newTextDelay = 2000;
let textArrayIndex = 0;
let charIndex = 0;
let typingTextSpan = null;

function type() {
    if (!typingTextSpan) return;
    if (charIndex < textArray[textArrayIndex].length) {
        typingTextSpan.textContent += textArray[textArrayIndex].charAt(charIndex);
        charIndex++;
        setTimeout(type, typingDelay);
    } else {
        setTimeout(erase, newTextDelay);
    }
}

function erase() {
    if (!typingTextSpan) return;
    if (charIndex > 0) {
        typingTextSpan.textContent = textArray[textArrayIndex].substring(0, charIndex - 1);
        charIndex--;
        setTimeout(erase, erasingDelay);
    } else {
        textArrayIndex++;
        if (textArrayIndex >= textArray.length) textArrayIndex = 0;
        setTimeout(type, typingDelay + 500);
    }
}

export function initTyping() {
    typingTextSpan = document.getElementById("typing-text");
    if (textArray.length && typingTextSpan) setTimeout(type, newTextDelay + 250);
}
