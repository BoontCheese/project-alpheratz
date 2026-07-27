const tabs = document.querySelectorAll(".tab");
const forms = document.querySelectorAll(".booking-form");
const observer = new IntersectionObserver(function(entries){

    entries.forEach(function(entry){

        if(entry.isIntersecting){

            entry.target.classList.add("show");

            observer.unobserve(entry.target);

        }

    });

});
const reveals = document.querySelectorAll(".reveal");

reveals.forEach(function(section){

    observer.observe(section);

});

const serviceCards = document.querySelectorAll(".service-card");

serviceCards.forEach(function(card, index){

    card.style.transitionDelay = `${index * 100}ms`;

});

const destinationCards = document.querySelectorAll(".destination-card");

destinationCards.forEach(function(card, index){

    card.style.transitionDelay = `${index * 100}ms`;

});

const youtubeCards = document.querySelectorAll(".youtube-card");

youtubeCards.forEach(function(card, index){

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
