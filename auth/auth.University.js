function showMessages(result) {
    console.log(result);
    let parentDiv = document.querySelector('.column');  // get the div 
    let h3Content = parentDiv.querySelectorAll('h3');   // get the h3 tag to add message after this
    let previosPTag = document.querySelectorAll('.form-subtitle.has-text-centered');    // get the explicit message to remove after second user attempt
    let message = previosPTag[1];
    // console.log(message);
    if(message){
        if(message.textContent.trim() !== '')
            message.textContent = "";
    }
    // console.log(message);
    let firstH3 = h3Content[0];
 
    let paragraph = document.createElement('p');
    paragraph.classList.add('form-subtitle', 'has-text-centered');
    // console.log(paragraph);
    paragraph.textContent = result.msg;
    paragraph.style.color = "#E41B17";
    parentDiv.insertBefore(paragraph, firstH3.nextSibling);    
}

$("#registerForm").submit(async function(event){

    event.preventDefault();
    // var unindexed_array = $(this).serializeArray();
    // var data = {}
    
    // $.map(unindexed_array, function(n, i){
    // data[n['name']] = n['value']
    // })
    // console.log(data);

    const uname = document.getElementById('uname').value;
    const email = document.getElementById('email').value;
    const error = document.getElementById("error");
    const btn = document.getElementById("registerBtn");
    const password = document.getElementById('password').value;
    const about = document.getElementById('about').value;
    btn.disabled = true;
    const result = await fetch('/api/university/university-register', {
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json',
        },
        body: JSON.stringify({
            uname, email, password, about
        })
    }).then((res) => res.json());

    if(result.status === 'fail'){
        error.innerHTML = result.msg;
        btn.disabled = false;
        setTimeout(() => {
            error.innerHTML = '';
        }, 4000)
        // showMessages(result);       
    }
        else if(result.status === 'success'){
            setTimeout(()=>{
                error.innerHTML = '';
            }, 4000);
            window.location.href = 'http://localhost:3000/university/login'
        }
})

$("#loginForm").submit(async function(event) {

    event.preventDefault();

    //get the data from user form
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const result = await fetch('/api/university/university-login', {
        method: 'POST',
        headers:{
            'Content-Type' : 'application/json'
        },
        body: JSON.stringify({
            email, password
        })
    }).then((res) => res.json());

    if(result.status === 'fail'){
        showMessages(result);
    }
        else if(result.status === 'success')
        window.location.href = 'http://localhost:3000/server'

})

$("#create-node-form").submit(async function(event) {
    event.preventDefault();
    
    const nodeName = document.getElementById('nodeName').value;
    const nodeTags = document.getElementById('nodeTags').value;
    const nodeAbout = document.getElementById('nodeAbout').value;
    const createNode = document.getElementById("create-node");
    createNode.disabled = true;
    const result = await fetch('/api/university/create-node', {
        method:'POST',
        headers:{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            nodeName, nodeTags,nodeAbout
        })
    }).then((res) => res.json());
    
    const errors = document.getElementById("errors");
    const success = document.getElementById('success');
    if(result.status === 'fail'){
        success.style.display = "none";
        errors.innerHTML = result.msg;
        errors.style.display = "block";
        createNode.disabled = false;
    }
    else if(result.status === 'success'){
        // console.log(result.node)
        errors.style.display = 'none';
        createNode.disabled = false;
        success.innerHTML = 'Node Started';
        success.style.display = 'block';
    }
})