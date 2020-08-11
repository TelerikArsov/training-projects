function showSnackbar(msg, success){
    var x = document.getElementById("snackbar");
    if(x) {
        if (success){
            x.style.backgroundColor = 'green';
        }else{
            x.style.backgroundColor = 'red';
        }
        x.innerHTML = "";
        var content = document.createTextNode(msg);
        x.appendChild(content);
        x.className = "show";
        setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
                
    }
}

function errorHandle (data, filterUL){
    console.log(data)
    if(data.errors){
        showSnackbar(`Error ${data.errors}`, false);
    }
    if(filterUL){
        filterUL.innerHTML = "";
        if(data.filterErrors){
            Object.values(data.filterErrors).forEach(val => {
                var li = document.createElement("li");
                li.appendChild(document.createTextNode(val.msg));
                filterUL.appendChild(li);
            });
        }
    }
}

function genericSubmitForm(data, event, form, success){
    $.each($(form).serializeArray(), function() {
        if (data[this.name]) {
            if (!data[this.name].push) {
                data[this.name] = [data[this.name]];
            }
            data[this.name].push(this.value || '');
        } else {
            data[this.name] = this.value || '';
        }
    });
    console.log(data)
    console.log($(form).attr('action'))
    $.ajax({
        data: data,
        type: 'POST',
        url: $(form).attr('action'),
        dataType: 'json',
        success: success || function(data){
            if (data.result == 'redirect') {
                //redirecting to main page from here.
                window.location.replace(data.url);
            }
        },
        error: function(data){
            errorHandle(data.responseJSON, $(form).children('.errors')[0])
        }
    })
    if(event){
        event.preventDefault();
    }
}
