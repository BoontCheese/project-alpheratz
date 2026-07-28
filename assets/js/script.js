const tabs = document.querySelectorAll(".tab");
const forms = document.querySelectorAll(".booking-form");
const observer = new IntersectionObserver(function(entries){

    entries.forEach(function(entry){

        if(entry.isIntersecting){

            entry.target.classList.add("show");

            setTimeout(function(){

            entry.target.style.transitionDelay = "0ms";

            }, 800);

            observer.unobserve(entry.target);

    }

    });

});
const reveals = document.querySelectorAll(".reveal");

reveals.forEach(function(section){

    observer.observe(section);

});

const cards = document.querySelectorAll(
    ".service-card, .destination-card, .youtube-card"
);

cards.forEach(function(card, index){

    card.style.transitionDelay = `${index * 100}ms`;

});

tabs.forEach(function(tab){

    tab.addEventListener("click", function(){

        // Move active tab
        tabs.forEach(function(item){
            item.classList.remove("active");
        });

        tab.classList.add("active");

        // Hide every form
        forms.forEach(function(form){
            form.classList.remove("active");
        });

        // Find the correct form
        const formId = tab.dataset.form + "-form";

        // Show the correct form
        document.getElementById(formId).classList.add("active");

    });

});

const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector(".mobile-menu");
const menuIcon = document.querySelector(".menu-toggle i");

menuToggle.addEventListener("click", function(){

    mobileMenu.classList.toggle("active");
    document.body.classList.toggle("menu-open");

    if (mobileMenu.classList.contains("active")){

        menuIcon.classList.remove("fa-bars");
        menuIcon.classList.add("fa-xmark");

    }else{

        menuIcon.classList.remove("fa-xmark");
        menuIcon.classList.add("fa-bars");

    }

});

const mobileLinks = document.querySelectorAll(".mobile-menu a");
mobileLinks.forEach(function(link){
    link.addEventListener("click", function(){
        mobileMenu.classList.remove("active");
        document.body.classList.remove("menu-open");
        menuIcon.classList.remove("fa-xmark");
        menuIcon.classList.add("fa-bars");  
    })
})

const counters = document.querySelectorAll(".passenger-counter");

counters.forEach(function(counter){

    const minus = counter.querySelector(".minus");
    const plus = counter.querySelector(".plus");
    const value = counter.querySelector(".counter-value");

    let count = Number(value.textContent);

    const min = Number(value.dataset.min);
    const max = Number(value.dataset.max);

    updateButtons();

    plus.addEventListener("click", function(){

        if(count < max){

            count++;

            value.textContent = count;

            updateButtons();

        }

    });

    minus.addEventListener("click", function(){

        if(count > min){

            count--;

            value.textContent = count;

            updateButtons();

        }

    });

    function updateButtons(){

        minus.disabled = count === min;

        plus.disabled = count === max;

    }

});