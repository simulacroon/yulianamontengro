/* =========================================================
   ELEMENTOS PRINCIPALES
========================================================= */

const cursor = document.getElementById("cursor");

const stopMotionSection =
    document.querySelector(".scroll-story");

const stopMotionFrames =
    document.querySelectorAll(".stopmotion-frame");

const currentFrameLabel =
    document.getElementById("current-frame");

const galleryItems =
    document.querySelectorAll(".gallery-item");

const navigationLinks =
    document.querySelectorAll(".side-nav a");

const pageSections =
    document.querySelectorAll("main section[id]");



/* =========================================================
   CURSOR PERSONALIZADO
========================================================= */

let mouseX = 0;
let mouseY = 0;

let cursorX = 0;
let cursorY = 0;


/*
El cursor no se mueve inmediatamente hacia la posición
del mouse. La interpolación genera un movimiento más suave.
*/

function animateCursor() {

    cursorX +=
        (mouseX - cursorX) * 0.18;

    cursorY +=
        (mouseY - cursorY) * 0.18;


    if (cursor) {

        cursor.style.transform =
            `translate3d(
                ${cursorX}px,
                ${cursorY}px,
                0
            )`;

    }


    requestAnimationFrame(animateCursor);

}


window.addEventListener(
    "pointermove",
    function (event) {

        mouseX =
            event.clientX;

        mouseY =
            event.clientY;

    }
);


if (
    cursor &&
    window.matchMedia("(pointer: fine)").matches
) {

    animateCursor();

}



/* =========================================================
   CURSOR SOBRE ENLACES
========================================================= */

const interactiveElements =
    document.querySelectorAll(
        "a, button, [tabindex]"
    );


interactiveElements.forEach(
    function (element) {

        element.addEventListener(
            "mouseenter",
            function () {

                cursor?.classList.add(
                    "is-hovering"
                );

            }
        );


        element.addEventListener(
            "mouseleave",
            function () {

                cursor?.classList.remove(
                    "is-hovering"
                );

            }
        );

    }
);



/* =========================================================
   CURSOR SOBRE LAS FOTOGRAFÍAS
========================================================= */

galleryItems.forEach(
    function (item) {

        item.addEventListener(
            "mouseenter",
            function () {

                cursor?.classList.remove(
                    "is-hovering"
                );

                cursor?.classList.add(
                    "is-viewing"
                );

            }
        );


        item.addEventListener(
            "mouseleave",
            function () {

                cursor?.classList.remove(
                    "is-viewing"
                );

            }
        );

    }
);



/* =========================================================
   STOP-MOTION CONTROLADO POR SCROLL
========================================================= */

let currentFrameIndex = 0;

let scrollAnimationFrame = null;


/*
Activa únicamente el fotograma correspondiente.
*/

function showStopMotionFrame(index) {

    if (
        index === currentFrameIndex &&
        stopMotionFrames[index]
            ?.classList.contains("is-active")
    ) {

        return;

    }


    currentFrameIndex =
        index;


    stopMotionFrames.forEach(
        function (frame, frameIndex) {

            frame.classList.toggle(
                "is-active",
                frameIndex === index
            );

        }
    );


    if (currentFrameLabel) {

        currentFrameLabel.textContent =
            String(index + 1).padStart(2, "0");

    }

}



/*
Calcula cuánto se ha recorrido dentro de la sección
del stop-motion.

La sección mide aproximadamente 300vh.

Primer tercio: yulia1.jpeg
Segundo tercio: yulia2.jpeg
Último tercio: yulia3.jpeg
*/

function updateStopMotion() {

    if (!stopMotionSection) {

        return;

    }


    const sectionRect =
        stopMotionSection.getBoundingClientRect();


    const availableScrollDistance =
        stopMotionSection.offsetHeight -
        window.innerHeight;


    const traveledDistance =
        -sectionRect.top;


    const progress =
        Math.min(
            1,
            Math.max(
                0,
                traveledDistance /
                Math.max(
                    1,
                    availableScrollDistance
                )
            )
        );


    const frameIndex =
        Math.min(
            stopMotionFrames.length - 1,
            Math.floor(
                progress *
                stopMotionFrames.length
            )
        );


    showStopMotionFrame(
        frameIndex
    );

}



/*
Se usa requestAnimationFrame para evitar ejecutar
demasiadas veces los cálculos durante el scroll.
*/

function handlePageScroll() {

    if (scrollAnimationFrame) {

        return;

    }


    scrollAnimationFrame =
        requestAnimationFrame(
            function () {

                updateStopMotion();

                scrollAnimationFrame =
                    null;

            }
        );

}


window.addEventListener(
    "scroll",
    handlePageScroll,
    {
        passive: true
    }
);


window.addEventListener(
    "resize",
    updateStopMotion
);


updateStopMotion();



/* =========================================================
   APARICIÓN DE FOTOGRAFÍAS DURANTE EL SCROLL
========================================================= */

const galleryObserver =
    new IntersectionObserver(

        function (entries) {

            entries.forEach(
                function (entry) {

                    if (
                        entry.isIntersecting
                    ) {

                        entry.target
                            .classList
                            .add("is-visible");

                    }

                }
            );

        },

        {
            threshold: 0.16,

            rootMargin:
                "0px 0px -10% 0px"
        }

    );


galleryItems.forEach(
    function (item) {

        galleryObserver.observe(
            item
        );

    }
);



/* =========================================================
   DESCRIPCIONES EN CELULAR
========================================================= */

/*
En escritorio las descripciones aparecen con hover.

En celular no existe hover, por lo que se agrega
la clase is-open cuando la persona toca la foto.
*/

galleryItems.forEach(
    function (item) {

        item.addEventListener(
            "click",
            function (event) {

                if (
                    window.matchMedia(
                        "(hover: none)"
                    ).matches
                ) {

                    event.stopPropagation();


                    galleryItems.forEach(
                        function (otherItem) {

                            if (
                                otherItem !== item
                            ) {

                                otherItem
                                    .classList
                                    .remove("is-open");

                            }

                        }
                    );


                    item.classList.toggle(
                        "is-open"
                    );

                }

            }
        );

    }
);


/*
Cierra las descripciones al tocar cualquier
parte vacía de la página.
*/

document.addEventListener(
    "click",
    function () {

        if (
            window.matchMedia(
                "(hover: none)"
            ).matches
        ) {

            galleryItems.forEach(
                function (item) {

                    item.classList.remove(
                        "is-open"
                    );

                }
            );

        }

    }
);



/* =========================================================
   MENÚ ACTIVO SEGÚN LA SECCIÓN
========================================================= */

const sectionObserver =
    new IntersectionObserver(

        function (entries) {

            entries.forEach(
                function (entry) {

                    if (
                        !entry.isIntersecting
                    ) {

                        return;

                    }


                    const currentSectionId =
                        entry.target.id;


                    navigationLinks.forEach(
                        function (link) {

                            const destination =
                                link
                                    .getAttribute("href")
                                    ?.replace("#", "");


                            link.classList.toggle(
                                "is-active",
                                destination ===
                                currentSectionId
                            );

                        }
                    );

                }
            );

        },

        {
            threshold: 0.35,

            rootMargin:
                "-20% 0px -45% 0px"
        }

    );


pageSections.forEach(
    function (section) {

        sectionObserver.observe(
            section
        );

    }
);



/* =========================================================
   SCROLL SUAVE PARA ENLACES INTERNOS
========================================================= */

const internalLinks =
    document.querySelectorAll(
        'a[href^="#"]'
    );


internalLinks.forEach(
    function (link) {

        link.addEventListener(
            "click",
            function (event) {

                const targetId =
                    link.getAttribute("href");


                if (
                    !targetId ||
                    targetId === "#"
                ) {

                    return;

                }


                const target =
                    document.querySelector(
                        targetId
                    );


                if (!target) {

                    return;

                }


                event.preventDefault();


                target.scrollIntoView(
                    {
                        behavior:
                            window.matchMedia(
                                "(prefers-reduced-motion: reduce)"
                            ).matches
                                ? "auto"
                                : "smooth",

                        block:
                            "start"
                    }
                );

            }
        );

    }
);



/* =========================================================
   CARGA DE IMÁGENES
========================================================= */

/*
Si alguna fotografía todavía no existe o tiene
un nombre diferente, muestra el nombre del archivo
que hace falta.
*/

const pageImages =
    document.querySelectorAll("img");


pageImages.forEach(
    function (image) {

        image.addEventListener(
            "error",
            function () {

                const imageContainer =
                    image.parentElement;


                if (!imageContainer) {

                    return;

                }


                const missingFile =
                    image
                        .getAttribute("src")
                        ?.split("/")
                        .pop();


                image.style.display =
                    "none";


                imageContainer
                    .classList
                    .add("missing-image");


                /*
                Evita crear varias veces el aviso.
                */

                if (
                    imageContainer.querySelector(
                        ".missing-image-label"
                    )
                ) {

                    return;

                }


                const label =
                    document.createElement(
                        "span"
                    );


                label.className =
                    "missing-image-label";


                label.textContent =
                    missingFile ||
                    "Imagen no encontrada";


                imageContainer.appendChild(
                    label
                );

            }
        );

    }
);