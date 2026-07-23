const tabs = document.querySelectorAll(".tab");
const forms = document.querySelectorAll(".booking-form");
const observer = new IntersectionObserver(function(entries){

    entries.forEach(function(entry){

        console.log(entry.target);
        console.log(entry.isIntersecting);

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
