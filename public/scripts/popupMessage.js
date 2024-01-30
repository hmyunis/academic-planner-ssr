function createPopUpMsg(msg, color, duration) {
    const modalHTML = `
    <div class="fixed bottom-0 right-0 w-full duration-300 transition-all" id="modalContainer">
        <div class="absolute bottom-2 duration-300 right-2 bg-${color??"slate"}-200 p-4 px-8 rounded-3xl text-lg rounded-br-none shadow-lg transition-all text-${color??"slate"}-950" id="modalContent">
            <p>${msg}</p>
        </div>
    </div>
    `;
    const newElement = document.createElement('div');
    newElement.innerHTML = modalHTML;
    document.body.appendChild(newElement);
    const modalContainer = document.getElementById('modalContainer');
    const modalContent = document.getElementById('modalContent');
    setTimeout(function () {
        modalContainer.style.opacity = '1';
        modalContent.style.transform = 'translate(-5%, -10%) scale(1)';
    }, 10);

    setTimeout(function () {
        modalContainer.style.opacity = '0';
        modalContent.style.transform = 'translate(-5%, -10%) scale(0.5)';
        setTimeout(function () {
            document.body.removeChild(newElement);
        }, +duration/10);
    }, +duration);
}