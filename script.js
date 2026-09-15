let correoMFA = "";
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxftlAaR92VHNXWvOPboKKOodBq4LLYIrQgnYLMm_P4lBWUDB4kZMaseEJOjz9X2cM/exec";

const pesoInput = document.getElementById("peso");
const totalInput = document.getElementById("total");

pesoInput.addEventListener("input", calcularTotal);

function calcularTotal() {

    const peso = parseFloat(pesoInput.value);

    if (isNaN(peso)) {
        totalInput.value = "";
        return;
    }

    const total = peso * 14 * 500;

    totalInput.value = total.toLocaleString("es-CR");
}

const btnLimpiar = document.getElementById("btnLimpiar");

btnLimpiar.addEventListener("click", () => {

    document.getElementById("provincia").value = "";
    document.getElementById("nombre").value = "";
    document.getElementById("peso").value = "";
    document.getElementById("total").value = "";

    document
        .getElementById("resumenFactura")
        .classList.add("d-none");

    document
        .getElementById("accionesFactura")
        .classList.add("d-none");

    ocultarExito();

});






const btnGenerar = document.getElementById("btnGenerar");

btnGenerar.addEventListener("click", mostrarResumen);

async function mostrarResumen() {

    ocultarError();
    ocultarExito();

    const nombre =
        document.getElementById("nombre").value;

    const peso =
        document.getElementById("peso").value;

    if (nombre.trim() === "") {

        mostrarError(
            "Debe ingresar un nombre."
        );

        return;
    }

    if (peso === "") {

        mostrarError(
            "Debe ingresar un peso."
        );

        return;
    }

    if (parseFloat(peso) <= 0) {

        mostrarError(
            "El peso debe ser mayor que cero."
        );

        return;
    }

    await guardarFactura();
    mostrarExito(
        "Factura guardada correctamente."
    );

    const total =
        document.getElementById("total").value;

    document.getElementById("nombreResumen")
        .textContent = capitalizarNombre(nombre);

    document.getElementById("totalResumen")
        .textContent = `₡${total}`;

    document.getElementById("resumenFactura")
        .classList.remove("d-none");

    document.getElementById("accionesFactura")
        .classList.remove("d-none");

}





function capitalizarNombre(nombre) {

    return nombre
        .toLowerCase()
        .split(" ")
        .map(
            palabra =>
                palabra.charAt(0).toUpperCase() +
                palabra.slice(1)
        )
        .join(" ");

}







const btnPNG = document.getElementById("btnPNG");

btnPNG.addEventListener("click", generarPNG);


function generarPNG() {

    const factura =
        document.getElementById("resumenFactura");

    html2canvas(factura, {
        scale: 2
    })
        .then(function (canvas) {

            const enlace =
                document.createElement("a");

            enlace.download =
                "factura-biin.png";

            enlace.href =
                canvas.toDataURL("image/png");

            enlace.click();

        });

}






async function guardarFactura() {

    const datos = {

        provincia:
            document.getElementById("provincia").value,

        nombre:
            document.getElementById("nombre").value,

        peso:
            document.getElementById("peso").value,

        total:
            document.getElementById("total").value

    };

    const respuesta = await fetch(
        WEB_APP_URL,
        {
            method: "POST",
            body: JSON.stringify(datos)
        }
    );

    return await respuesta.json();

}











function mostrarError(mensaje) {

    const contenedor =
        document.getElementById("mensajeError");

    contenedor.textContent = mensaje;

    contenedor.classList.remove("d-none");

}


function ocultarError() {

    document
        .getElementById("mensajeError")
        .classList.add("d-none");

}







function mostrarExito(mensaje) {

    const contenedor =
        document.getElementById("mensajeExito");

    contenedor.textContent = mensaje;

    contenedor.classList.remove("d-none");

}

function ocultarExito() {

    document
        .getElementById("mensajeExito")
        .classList.add("d-none");

}









const btnCompartir =
    document.getElementById("btnCompartir");

btnCompartir.addEventListener(
    "click",
    compartirWhatsApp
);











async function compartirWhatsApp(){

    const factura =
        document.getElementById("resumenFactura");

    const canvas =
        await html2canvas(factura,{
            scale:2
        });

    canvas.toBlob(async function(blob){

        const archivo = new File(
            [blob],
            "factura-biin.png",
            {
                type:"image/png"
            }
        );

        if(
            navigator.canShare &&
            navigator.canShare({
                files:[archivo]
            })
        ){

            try{

                await navigator.share({
                    files:[archivo]
                });

            }
            catch(error){

                console.log(error);

            }

        }
        else{

            alert(
                "Tu dispositivo o navegador no admite compartir imágenes directamente."
            );

        }

    },"image/png");

}













const btnLogin =
    document.getElementById("btnLogin");

btnLogin.addEventListener(
    "click",
    iniciarSesion
);









function iniciarSesion() {
    const correo =
        document.getElementById("correo").value;
    correoMFA = correo;
    const password =
        document.getElementById("password").value;
    validarLogin(correo, password)
        .then(usuarioValido => {
            if (usuarioValido) {
                document
                    .getElementById("loginContainer")
                    .classList.add("d-none");

                document
                    .getElementById("mfaContainer")
                    .classList.remove("d-none");
            }
            else {
                alert(
                    "Correo o contraseña incorrectos."
                );
            }
        });
}











const btnLogout =
    document.getElementById("btnLogout");

btnLogout.addEventListener(
    "click",
    cerrarSesion
);

function cerrarSesion() {

    document
        .getElementById("appContainer")
        .classList.add("d-none");

    document
        .getElementById("loginContainer")
        .classList.remove("d-none");

    document
        .getElementById("correo").value = "";

    document
        .getElementById("password").value = "";

}






async function validarLogin(correo, password) {

    const url =
        `${WEB_APP_URL}?accion=login&correo=${encodeURIComponent(correo)}&password=${encodeURIComponent(password)}`;

    const respuesta =
        await fetch(url);

    const datos =
        await respuesta.json();

    return datos.acceso;

}

async function validarMFA(correo, codigo){

    const url =
        `${WEB_APP_URL}?accion=validarMFA&correo=${encodeURIComponent(correo)}&codigo=${encodeURIComponent(codigo)}`;

    const respuesta =
        await fetch(url);

    const datos =
        await respuesta.json();

    return datos.valido;

}


const btnVerificarMFA =
    document.getElementById("btnVerificarMFA");

btnVerificarMFA.addEventListener(
    "click",
    verificarCodigoMFA
);


async function verificarCodigoMFA(){

    const codigo =
        document.getElementById("codigoMFA").value;

    const valido =
        await validarMFA(
            correoMFA,
            codigo
        );

    if(valido){

        document
            .getElementById("mfaContainer")
            .classList.add("d-none");

        document
            .getElementById("appContainer")
            .classList.remove("d-none");

    }
    else{

        alert(
            "Código MFA incorrecto."
        );

    }

}












console.log(html2canvas);