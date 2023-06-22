const API_URL = "https://localhost:7236";

document.addEventListener("DOMContentLoaded", function () {
    const fileInput = document.getElementById("file");
    const previewImage = document.getElementById("preview");
    const discoverButton = document.getElementById("discover");
    const clearButton = document.getElementById("clear");
    const resultText = document.getElementById("result");

    const mainForm = document.getElementById("main-form");

    let file;

    function setPreview() {
        const files = fileInput.files[0];
        if (files) {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(files);
            fileReader.addEventListener("load", function () {
                previewImage.setAttribute("src", this.result);
                file = this.result;

                discoverButton.removeAttribute("disabled");
                clearButton.removeAttribute("disabled");
            });
        } else {
            previewImage.setAttribute("src", "./images/plug.svg");
        }
    }

    // Отображение загруженной картинки
    fileInput.addEventListener("change", function () {
        setPreview();
    });

    // Кнопка "Обнаружить"
    mainForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        const formData = new FormData();

        formData.append("image", fileInput.files[0]);

        if (file) {
            try {
                const result = await fetch(`${API_URL}/api/picture`, {
                    method: "POST",
                    body: formData,
                    // headers: {
                    //     "Content-Type": "multipart/form-data",
                    // },
                });
                const jsonData = await result.json();
                console.log(jsonData.description);
                resultText.textContent = jsonData.description;
                resultText.style.display = "block";
            } catch (error) {
                resultText.textContent = "Что-то пошло не так!";
                resultText.style.display = "block";
                console.error("Error:", error);
            }
        }
    });

    // Кнопка "Очистить"
    clearButton.addEventListener("click", function () {
        fileInput.value = "";
        setPreview();
        file = undefined;
    });
});
