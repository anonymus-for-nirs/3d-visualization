const dialog = document.getElementById('dialogGuide');

document.getElementById('guide').onclick = function() {
    dialog.show();
    document.getElementById('blackBlock').style.display = 'block';
}

document.getElementById('close').onclick = function() {
    dialog.close();
    document.getElementById('blackBlock').style.display = 'none';
}
