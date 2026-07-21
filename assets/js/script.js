const tabs = document.querySelectorAll(".tab");
const forms = document.querySelectorAll(".booking-form");
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