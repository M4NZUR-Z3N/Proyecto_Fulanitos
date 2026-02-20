document.getElementById('image').addEventListener('mouseover', function() {
    this.style.transform = 'rotate(360deg)';
});
document.getElementById('image').addEventListener('mouseout', function() {
    this.style.transform = 'rotate(0deg)';
});