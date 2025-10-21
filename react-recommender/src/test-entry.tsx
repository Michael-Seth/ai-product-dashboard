// Simple test entry point
console.log('Test entry point loaded');

// Test customElements
if (typeof customElements !== 'undefined') {
  console.log('customElements is available');
} else {
  console.log('customElements is NOT available');
}

export default function testFunction() {
  console.log('Test function called');
}