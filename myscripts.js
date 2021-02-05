// Switch to tab menu
if (document.getElementById("review")) {
    document.getElementById("review").addEventListener('click', function () {
        document.getElementById("homeBlog").style.cssText = 'display:flex;';
        document.getElementById("write-your-blog").style.cssText = 'display:none;';
        document.getElementById("blogDetails").style.cssText = 'display:none;';
    })
}
if (document.getElementById("home")) {
    document.getElementById("home").addEventListener('click', function () {
        document.getElementById("homeBlog").style.cssText = 'display:flex;';
        document.getElementById("write-your-blog").style.cssText = 'display:none;';
        document.getElementById("blogDetails").style.cssText = 'display:none;';
    })
}

if (document.getElementById("blog")) {
    document.getElementById("blog").addEventListener('click', function () {
        document.getElementById("write-your-blog").style.cssText = 'display:block;';
        document.getElementById("homeBlog").style.cssText = 'display:none;';
        document.getElementById("blogDetails").style.cssText = 'display:none;';
    })
}

// Write a blog

let blogger = [];
const formSubmitButton = document.getElementById("formSubmission");

const submitData = async (event) => {
    event.preventDefault(); // To stop the form Submitting
    var addImage = document.getElementById("img_ip");
    let formValue = {
        "id": document.getElementsByClassName('grid-item homeblogData').length + 1, //default ID set
        "blogTitle": document.getElementById("btitle_ip").value,
        "writer": document.getElementById("blog-owner_ip").value,
        "content": document.getElementById("content_ip").value,
        "blogImage": addImage.value,
        "publisher": document.getElementById("publisher_ip").value,
        "isClosable": false
    }
    // Store JSON data
    if (validateForm() === true) {
        blogger.push(formValue);
        // localStorage.setItem("newBlog", JSON.stringify(blogger, null, '\t'));
        await fetch('http://localhost:3000/post/blogdetails', {
            method: "POST",
            body: JSON.stringify(blogger),
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json;charset=utf-8"
            }
        })
    }

    // Upload Image to path specific folder
    if (addImage.value !== "") {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        var formdata = new FormData();
        formdata.append("img", addImage.files[0]);

        var requestOptions = {
            mode: 'no-cors',
            method: 'POST',
            headers: myHeaders,
            body: formdata,
            redirect: 'follow'
        };

        fetch("http://localhost:3000/upload-blog-img", requestOptions)
            .then(response => response.text())
            .then(result => console.log(result))
            .catch(error => console.log('error', error));
    }

    document.querySelector('form').reset()
    location.reload(true);
}
formSubmitButton.addEventListener("click", submitData);

// ------------------------------------ Write your Blog (Blog input Validation)------------------------------------
function validateForm() {
    var newTitle = document.forms["validForm"]["btitle"].value;
    var newOwner = document.forms["validForm"]["bowner"].value;
    var newContent = document.forms["validForm"]["bcontent"].value;
    var newPublisher = document.forms["validForm"]["bpublisher"].value;
    if (newTitle == "") {
        alert("Title must be filled out");
        return false;
    } else if (newOwner == "") {
        alert("Name Must be filled out");
        return false;
    } else if (newContent == "") {
        alert("Content Must be filled out");
        return false;
    } else if (newPublisher == "") {
        alert("Publisher Name Must be filled out");
        return false;
    } else {
        return true;
    }
}
// -------------------------------Home & Blog Details-------------------------------------------------------
// Read from a JSON file
let blogCard;
let setId;
let globalId;
let closeBlog;
//fetch("./json/index.json")
fetch('http://localhost:3000/get/blogdetails', {
    method: "get"
})
    .then(response => response.json())
    .then(val => {
        var outputHTML = "";
        val.forEach((value, i) => {
            // Display blocks on home page 
            outputHTML += `<div data-id=${value.id} class="grid-item homeblogData" style="background-color:rgb(248, 248, 248);">
            <strong id="btitle">${value.blogTitle} </strong><br>
            <span id="bowner" class="blog-owner"> -${value.writer}</span><br><br><br><br> <hr>
            <span id="bpublisher" class="publisher">${value.publisher}</span>
            </div>`
        });
        document.getElementById("homeBlog").innerHTML = outputHTML;
        blogCard = document.getElementsByClassName("homeblogData");
        // Blog Details Page
        setId = document.getElementsByClassName("card")[0];
        // fetch & show data from JSON file         
        for (let i = 0; i < blogCard.length; i++) {
            blogCard[i].addEventListener("click", () => {
                console.log(blogCard[i].dataset.id);
                setId.setAttribute("id", blogCard[i].dataset.id)
                document.getElementById("blogDetailsTitle").innerHTML = val[i].blogTitle;
                document.getElementById("blogDetailsWriter").innerHTML = val[i].writer;
                document.getElementById("blogDetailsContent").innerHTML = val[i].content;
                let imageView = document.getElementById("blogDetailsImage");
                if (!!val[i].blogImage.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
                    imageView.setAttribute('src', `http://localhost:3000/assets/${val[i].blogImage}`);
                } else {
                    imageView.style.cssText = 'display:none;';
                }
                document.getElementById("blogDetailsPublisher").innerHTML = val[i].publisher;
                document.getElementById("homeBlog").style.cssText = 'display:none;';
                document.getElementById("blogDetails").style.cssText = 'display:block;';
                closeBlog = val[i].isClosable;
                globalId = blogCard[i].dataset.id;
                renderComments();
            });
        }
    });

// ------------------------------------Close Button Handle in Blog Details Page ------------------
let closeButton = document.getElementsByClassName('close');

let blockCommentingOnClose = () => {
    let currID = document.getElementsByClassName('card')[0].id;
    if (currID === globalId) {
        document.getElementById('newComment').style.display = "none";
        commentSection.forEach(comment => {
            if (comment.blogId === globalId) {
                let replyComment = Array.from(document.getElementsByClassName('child-reply'));
                for (let i = 0; i < replyComment.length; i++) {
                    replyComment[i].setAttribute('style', 'display:none;')
                }
            }
        });
    }
    // call API sending globalID and allow to stop commenting
    if (closeBlog === false) {
        const mystr = {
            "isClosable": true
        }
        fetch(`http://localhost:3000/put/update/${globalId}`, {
            method: "PATCH",
            body: JSON.stringify(mystr),
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            }
        })
    }
}

closeButton[0].addEventListener("click", blockCommentingOnClose);


// ------------------------------------Comment Section ------------------------------------
let commentSection = new Array();

// Fetch Comment data from localStorage/ JSON file if exists
(() => {
    fetch('http://localhost:3000/get/commentdetails', {
        method: "get"
    }).then(response => response.json())
        .then(commentString => {
            if (commentString !== null) {
                commentSection = commentString;
                for (let i = 0; i < commentSection.length; i++) {
                    commentSection[i].lastUpdated = new Date(commentSection[i].lastUpdated); // converting string to date object
                    commentSection[i].childrenIds = JSON.parse(commentSection[i].childrenIds); // converting string back to array form
                    if (!commentSection[i].image.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
                        commentSection[i].image = "";
                    }
                }
            }
        })
        .catch(error => console.log('error', error));
})();

// Fetch Details on DOM Load
document.addEventListener('DOMContentLoaded', (params) => {
    if (commentSection.length) {
        // Fetch All comments from storage when DOM Loaded
        renderComments();
    }
    // Click event for commment button 
    // Add comment to Storage & render on UI
    const addButton = document.getElementById("parentComments");
    addButton.addEventListener("click", () => {
        let name = document.getElementById("name").value;
        let content = document.getElementById("comment").value;
        let presentBlogId = document.getElementsByClassName("card")[0].getAttribute("id");
        let commentImage = JSON.stringify(document.getElementsByClassName("img_ci")[0].value).slice(1, -1);
        let commentFlag = 0;
        addComment(name, content, null, presentBlogId, commentImage, commentFlag);
    }, false);
    // Click event for list of comments need to show
    const commentsList = document.getElementById("showComments");
    commentsList.addEventListener("click", (event) => {
        if (event.target.nodeName === 'A' || event.target.nodeName === 'BUTTON') {
            let parts = event.target.id.split("-");
            let type = parts[0];
            let id = parts[parts.length - 1];
            let val = event.target.id.split("reply-")[1];
            // check if clicked on reply & avoid multiple clicks on reply button
            if (type == 'reply' && !document.getElementById("input-" + val)) {
                let inputElement = `
                    <li id="input-${val}">
                    <div class="comment-input-row">
						<div>
							<input type="text" placeholder="Name" id="name-${val}" class="name-handle" />
						</div>
                    </div>
                    <div id="replyCommentImage" class="comment-input">
                            <label for="img">Select image:</label><br>
                            <input type="file" class="img_ci" name="img" accept="image/*">
                    </div>
                    <div>
						<textarea rows="5" id="content-${val}" class="comment-box" placeholder="Your reply...."></textarea>
						<div>
							<button id="addreply-${val}" class="add-btn">Submit</button>
						</div>
					</div>
					</li>
                `;
                let childListElemId = `childlist-${event.target.id.split("reply-")[1]}`;
                let childListElem = document.getElementById(childListElemId);

                // setting a new child element ul#childlist-0
                if (childListElem == null) {
                    childListElem = `<ul id="childlist-${event.target.id.split("reply-")[1]}"> ${inputElement} </ul>`;
                    document.getElementById(`comment-${val}`).innerHTML += childListElem;
                } else {
                    childListElem.innerHTML = inputElement + childListElem.innerHTML;
                }
            } else if (type == 'addreply') { // on click of submit button after input given to reply
                let content = document.getElementById(`content-${val}`).value;
                let name = document.getElementById(`name-${val}`).value;
                let currentBlogId = document.getElementsByClassName("card")[0].getAttribute("id");
                let replyImage = JSON.stringify(document.getElementsByClassName("img_ci")[1].value).slice(1, -1);
                let replyFlag = 1;
                addComment(name, content, id, currentBlogId, replyImage, replyFlag);
            }
        }
    }, false);
}, false);

// Store Comment Data to localStorage
let storeComments = async (flag) => {
    let commentImage = document.getElementsByClassName("img_ci")[flag]
    let str = "[";
    commentSection[commentSection.length-1].image= 'cimg-'+commentSection[commentSection.length-1].id+'-'+commentSection[commentSection.length-1].image.split('\\').pop()
    for (let i in commentSection) {
        str += Comment.toJSONString(commentSection[i]);
        (i != commentSection.length - 1) ? str += "," : str += "";
    }
    str += "]";
    if (commentImage.value !== "") {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        var formdata = new FormData();
        formdata.append("cimg", commentImage.files[0]);

        var requestOptions = {
            mode: 'no-cors',
            method: 'POST',
            headers: myHeaders,
            body: formdata,
            redirect: 'follow'
        };
        await fetch('http://localhost:3000/post/commentdetails', {
            method: "POST",
            body: str,
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json;charset=utf-8"
            }
        })
        fetch("http://localhost:3000/upload-blog-img/comments", requestOptions)
            .then(response => response.text())
            .then(result => console.log(result))
            .catch(error => console.log('error', error));
    }

}
// display comments under ul#childlist-0
let renderComment = (comment) => {
    let id = comment.id;
    let listElements = `            
            <li id="comment-${id}">
            <div class="comment-header">
				<div  class="comment-name">
					${comment.name}
                </div>
                <div style="color:rgba(0,0,0,0.3);margin-top:20px;">
					posted ${timeAgo(comment.lastUpdated)}
			    </div>
            </div> 
            
			<div class="comment-content">
			 ${comment.content}
            </div>
            <img src="http://localhost:3000/assets/${comment.image}" id="commentDisplayImage" class="dummycimg" alt="Img">
            
            <div>
				<button id="reply-${id}" class="child-reply">Reply</button>
            </div><br>`;
    if (comment.childrenIds.length != 0) {
        listElements += `<ul id="childlist-${id}">`
        comment.childrenIds.forEach(commentId => {
            // recursive call inorder to handle nesting of child elements(grand child).
            listElements += renderComment(commentSection[commentId])
        });
        listElements += "</ul>";
    }
    listElements += "</li>";
    return listElements;
}
// pass parent comment from rootComments to renderComment
let renderComments = () => {
    let rootComments = [];
    commentSection.forEach(comment => {
        // parent comment pushed to rootcomment
        if (comment.parentId === null || comment.parentId == "null") {
            rootComments.push(comment);
        }
    });
    let commentList = '';
    rootComments.forEach(comment => {
        // Appending all Parents
        if (comment.blogId === globalId) {
            commentList += renderComment(comment);
        }
    });
    document.getElementById("showComments").innerHTML = commentList;
    if (closeBlog === true) {
        blockCommentingOnClose();
    } else {
        document.getElementById('newComment').style.display = "block";
    }
    let commentImage = Array.from(document.getElementsByClassName('dummycimg'));
    for (let i = 0; i < commentImage.length; i++) {
        if (!commentImage[i].src.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
            commentImage[i].setAttribute('style', 'display:none;');
            commentImage[i].removeAttribute('src')
        }
    }
}

// Adding new comment to memory and render immediately on UI
let addComment = (name, content, parent, blogId, image, flag) => {
    let comment = new Comment(commentSection.length, name, content, parent, blogId, image)
    commentSection.push(comment);
    if (parent != null) {
        commentSection[parent].childrenIds.push(commentSection.length - 1);
    }
    if ((flag === 0 && validateCommentInput())|| (flag === 1 && validateReplyCommentInput())) {
        storeComments(flag);
        document.getElementsByClassName('userCommentForm')[0].reset();
    } else {
        alert('You can not reply on two comments at a time.')
    }
    setTimeout(renderComments(), 100000);
}

function validateCommentInput() {
    var newName = document.forms["validCommentInput"]["userName"].value;
    var newComment = document.forms["validCommentInput"]["myComment"].value;
    if (newName == "") {
        alert("Enter your Name first..");
        return false;
    } else if (newComment == "") {
        alert("Mention your comment..");
        return false;
    } else {
        return true;
    }
}

function validateReplyCommentInput() {
    var newName = document.getElementsByClassName('name-handle')[1].value;
    var newComment = document.getElementsByClassName('comment-box').value;
    if (newName == "") {
        alert("Enter your Name first on reply section..");
        return false;
    } else if (newComment == "") {
        alert("Mention your comment on reply section..");
        return false;
    } else {
        return true;
    }
}
class Comment {
    constructor(id, name, content, parentId, blogId, image) {
        this.id = id;
        this.name = name;
        this.content = content;
        this.childrenIds = [];
        this.parentId = parentId;
        this.blogId = blogId;
        this.image = image;
        this.lastUpdated = new Date();
    }
    // JSON Strig will send/Save data on LocalStorage
    static toJSONString(comment) {
        return `{            
            "id" : "${comment.id}",
            "name" : "${comment.name}",
            "content" : "${comment.content}",
            "parentId" : "${comment.parentId}",
            "childrenIds" : "${JSON.stringify(comment.childrenIds)}",         
            "blogId" : "${comment.blogId}",
            "image" : "${comment.image}",
            "lastUpdated": "${comment.lastUpdated}"
        }`;
    }
}
// match the timings with record and render that according to current timings
let timeAgo = (date) => {
    let currentDate = new Date();
    let yearDifference = currentDate.getFullYear() - date.getFullYear();

    if (yearDifference > 0)
        return `${yearDifference} year${yearDifference == 1 ? "" : "s"} ago`;

    let monthDifference = currentDate.getMonth() - date.getMonth();
    if (monthDifference > 0)
        return `${monthDifference} month${monthDifference == 1 ? "" : "s"} ago`;

    let dateDifference = currentDate.getDate() - date.getDate();
    if (dateDifference > 0)
        return `${dateDifference} day${dateDifference == 1 ? "" : "s"} ago`;

    let hourDifference = currentDate.getHours() - date.getHours();
    if (hourDifference > 0)
        return `${hourDifference} hour${hourDifference == 1 ? "" : "s"} ago`;

    let minuteDifference = currentDate.getMinutes() - date.getMinutes();
    if (minuteDifference > 0)
        return `${minuteDifference} minute${minuteDifference == 1 ? "" : "s"} ago`;
    return `a few seconds ago`;
}