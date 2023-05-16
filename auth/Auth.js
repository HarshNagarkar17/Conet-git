// $("#update-cover-photo").submit(async function(event) {
//     event.preventDefault();
//     const upload_cover_picture = document.getElementById('upload-cover-picture');
//     const formData = new FormData();
//     formData.append('file', upload_cover_picture.files[0]);
//     await fetch('/api/user/change-cover-photo', {
//         method:'POST',
//         body: formData
//     }).then((res) => {
//         console.log(res.file, 'file')
//     }).catch((err) => {
//         console.log(err);
//     })
//     // alert(file.name);

//     // const result = await fetch()
//     // console.log(file);   
// })


$("#loginForm").submit(async function(event){

    event.preventDefault();
    const btn = document.getElementById("loginButton");
    // var unindexed_array = $(this).serializeArray();
    // var data = {}
    // $.map(unindexed_array, function(n, i){
    // data[n['name']] = n['value']
    // })
    // console.log(data);
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const result = await fetch('/api/user/loginStudent', {
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json',
        },
        body: JSON.stringify({
            email, password
        })
    }).then((res) => res.json())
    if(result.status === 'fail'){
        showMessages(result);
        btn.disabled = false;
    }else if(result.status === 'success'){
        btn.disabled = true;
        window.location.href = 'http://localhost:3000/student/profile'
        }
})

// a javaScript function to show my js dom skills
function showMessages(result) {
        // console.log(result);
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


$("#publishPost").submit(async function(event) {
    event.preventDefault();
    alert('posted');
})

$("#verifyOTP").submit(async function(e) {
    e.preventDefault();
    // alert('asas');
    const otp = document.getElementById('otp').value;
    // alert(otp);
    const result = await fetch('/api/user/verify-otp', {
        method: 'POST',
        headers:{
            'Content-Type' : 'application/json'
        },
        body: JSON.stringify({
            otp
        })
    }).then((res) => res.json())
    .catch((err) => console.log(err));
    
    if(result.status === 'fail')
        alert(result.msg);
    else if(result.status === 'success')
        window.location.href = 'http://localhost:3000/student/profile';

})

$("#registerForm").submit(async function(event){
    event.preventDefault();

    // var unindexed_array = $(this).serializeArray();
    // var data = {}

    // $.map(unindexed_array, function(n, i){
    //     data[n['name']] = n['value']
    // })

    const email = document.getElementById('email').value;
    const firstname = document.getElementById('fname').value;
    const lastname = document.getElementById('lname').value;
    const btn = document.getElementById("registerBtn");
    const department = document.getElementById('department').value;
    const password = document.getElementById('password').value;
    console.log('dept', department);
    const result = await fetch('/api/user/registerStudent', {
        method: 'POST',
        headers:{
            'Content-Type' : 'application/json'
        },
        body: JSON.stringify({
            firstname,lastname,email,password,department
        })
    }).then((res) => res.json());

    if(result.status === 'fail'){
        showMessages(result)
        btn.disabled = false;
    }
    else if(result.status === 'success'){
        btn.disabled = true;
        window.location.href = 'http://localhost:3000/student/register/authenticate/otp'; 
    }
//    $.post('http://localhost:3000/api/user/loginStudent', data, function(res) {
//         let err = "";
//         if(res.errors) {
//             let e = res.errors
            
//             e.forEach((error) => {
//                 err += error.msg;
//             })
//             alert(err)
//         }
//         else if(res.student){
//             // window.location.href = 'http://localhost:3000/feed'
//             alert('logged In');
//             // const redirect = (req, res) => {
//             //     res.redirect('/profile')
//             // }
//             // res.redirect('/profile')
//         }
//    })
})
// const rform = document.getElementById("rform");
// rform.addEventListener('submit', login);

// const form = document.getElementById("loginForm");
// form.addEventListener('submit', login);


// const registerForm = document.getElementById('registerForm');
// registerForm.addEventListener('submit', registerUniversity)


async function login(event) {
    event.preventDefault();
    // var unindexed_array = $(this).serializeArray();
    // var data = {}
    
    // $.map(unindexed_array, function(n, i){
    // data[n['name']] = n['value']
    // })
    // console.log(data);
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const result = await fetch('/api/user/loginStudent', {
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json',
        },
        body: JSON.stringify({
            email, password
        })
    }).then((res) => res.json())

    let err = "";
    if(result.status === 'fail'){
        alert(result.msg)
    }else{
        // alert('logged In');
        window.location.href = 'http://localhost:3000/profile'
    }

}


async function registerUniversity(event) {
    event.preventDefault();
    alert('clicked');
}
// $("#registerForm").submit(function(event){
//     event.preventDefault();

//     var unindexed_array = $(this).serializeArray();
//     var data = {}
//     // 
//     $.map(unindexed_array, function(n, i){
//         data[n['name']] = n['value']
//     })

//     console.log(data);
//     $.post('http://localhost:3000/api/user/registerStudent', data, function(res){
//         let err = ''
//         if(res.errors){
//             let e = res.errors
//             e.forEach((error) => {
//                 err += error.msg
//             })
//             alert(err)
//         }else if(res.createStudent){
//             alert('student created')
//             // window.location.href = 'http://localhost:3000/feed'
//         }else{
//             alert('error')
//         }
//     })
// })

$("#update-skill").submit(function(event){
    event.preventDefault();

    let skills = $("#studentSkills option:selected").text();
    alert(skills);

})