// ===== Elementos del DOM =====
const zonaPregunta = document.getElementById("quiz-pregunta");
const zonaResultado = document.getElementById("quiz-resultado");
const mensajeError = document.getElementById("quiz-error");

const contador = document.getElementById("quiz-contador");
const barraRelleno = document.getElementById("quiz-barra-relleno");
const textoPregunta = document.getElementById("quiz-texto");
const contenedorOpciones = document.getElementById("quiz-opciones");
const botonSiguiente = document.getElementById("quiz-siguiente");
const botonReiniciar = document.getElementById("quiz-reiniciar");

const resultadoImagen = document.getElementById("resultado-imagen");
const resultadoNombre = document.getElementById("resultado-nombre");
const resultadoFrase = document.getElementById("resultado-frase");
const resultadoEnlace = document.getElementById("resultado-enlace");

// ===== Estado del quiz =====
let datos = null;          // aquí queda guardado todo el JSON
let indiceActual = 0;      // en qué pregunta vamos (0 = primera)
let opcionElegida = null;  // la opción que marcó la persona en esta pregunta
let puntaje = {};          // por ejemplo { mexico: 3, colombia: 5, ... }

// ===== 1. Cargar el JSON =====
async function cargarQuiz() {
    try {
        const respuesta = await fetch("data/quiz.json");
        if (!respuesta.ok) {
            throw new Error("No se pudo leer quiz.json");
        }
        datos = await respuesta.json();
        iniciarQuiz();
    } catch (error) {
        console.error(error);
        zonaPregunta.hidden = true;
        mensajeError.hidden = false;
    }
}

// ===== 2. Empezar (o reiniciar) =====
function iniciarQuiz() {
    indiceActual = 0;
    opcionElegida = null;

    // Empezamos con todos los países en 0 puntos
    puntaje = {};
    for (const id in datos.resultados) {
        puntaje[id] = 0;
    }

    zonaResultado.hidden = true;
    zonaPregunta.hidden = false;
    mostrarPregunta();
}

// ===== 3. Dibujar la pregunta actual =====
function mostrarPregunta() {
    const pregunta = datos.preguntas[indiceActual];
    const total = datos.preguntas.length;

    contador.textContent = `Pregunta ${indiceActual + 1} de ${total}`;
    barraRelleno.style.width = `${((indiceActual + 1) / total) * 100}%`;
    textoPregunta.textContent = pregunta.texto;

    // Limpiamos las opciones de la pregunta anterior y creamos las nuevas
    contenedorOpciones.innerHTML = "";
    pregunta.opciones.forEach((opcion) => {
        const boton = document.createElement("button");
        boton.type = "button";
        boton.className = "quiz-opcion";
        boton.textContent = opcion.texto;
        boton.addEventListener("click", () => elegirOpcion(boton, opcion));
        contenedorOpciones.appendChild(boton);
    });

    // Reiniciamos el botón para esta pregunta
    opcionElegida = null;
    botonSiguiente.disabled = true;
    botonSiguiente.textContent =
        indiceActual === total - 1 ? "Ver mi resultado" : "Siguiente";
}

// ===== 4. Cuando la persona elige una opción =====
function elegirOpcion(botonClicado, opcion) {
    opcionElegida = opcion;

    // Quitamos la marca a todas y se la ponemos a la elegida
    contenedorOpciones.querySelectorAll(".quiz-opcion").forEach((boton) => {
        boton.classList.remove("seleccionada");
        boton.setAttribute("aria-pressed", "false");
    });
    botonClicado.classList.add("seleccionada");
    botonClicado.setAttribute("aria-pressed", "true");

    botonSiguiente.disabled = false;
}

// ===== 5. Botón siguiente: sumar puntos y avanzar =====
function siguiente() {
    if (opcionElegida === null) return;

    // Sumamos los puntos de la opción elegida
    for (const id in opcionElegida.puntos) {
        puntaje[id] += opcionElegida.puntos[id];
    }

    indiceActual++;

    if (indiceActual < datos.preguntas.length) {
        mostrarPregunta();
    } else {
        mostrarResultado();
    }
}

// ===== 6. Calcular y mostrar el país ganador =====
function calcularGanador() {
    let ganador = null;
    let maximo = -1;

    for (const id in puntaje) {
        // Si hay empate, gana el primero que aparece en el JSON
        if (puntaje[id] > maximo) {
            maximo = puntaje[id];
            ganador = id;
        }
    }
    return ganador;
}

function mostrarResultado() {
    const id = calcularGanador();
    const pais = datos.resultados[id];

    resultadoImagen.src = `img/paises/${id}-pais.jpg`;
    resultadoImagen.alt = `Imagen de ${pais.nombre}`;
    resultadoNombre.textContent = pais.nombre;
    resultadoFrase.textContent = pais.frase;
    resultadoEnlace.href = `pais.html?id=${id}`;
    resultadoEnlace.textContent = `Conocer ${pais.nombre}`;

    zonaPregunta.hidden = true;
    zonaResultado.hidden = false;
}

// ===== Eventos y arranque =====
botonSiguiente.addEventListener("click", siguiente);
botonReiniciar.addEventListener("click", iniciarQuiz);

cargarQuiz();