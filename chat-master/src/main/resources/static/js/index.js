var friends, chat, sendId, receiveId;

function initFriendAndChat() {
    friends = {
        list: document.querySelector('ul.people'),//获取好友列表
        all: document.querySelectorAll('.left .person'),//获取所有好友
        name: ''
    };

    chat = {
        container: document.querySelector('.container .right'),//获取聊天栏
        current: null,
        person: null,
        name: document.querySelector('.container .right .top .name')
    };//获取聊天对象名称

    // 监听鼠标点击事件，使点击对象处于active状态
    friends.all.forEach(function (f) {
        f.addEventListener('mousedown', function () {
            f.classList.contains('active') || setActiveChat(f);
        });
    });
}


function initFriend() {
    var userId = document.getElementById("userIf").alt;
    var friendIds = "";
    xmlHttp.open("POST", "/friend/getAll", true);
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4) {
            if (xmlHttp.status == 200) {
                var data = xmlHttp.responseText;
                var obj = JSON.parse(data);
                var listFriend = '';
                var chatWindowDivs = "";
                for (var i in obj) {
                    var friendId = obj[i].friendId;
                    friendIds += friendId + " ";
                    var userId = obj[i].userId;
                    var image = obj[i].image;
                    var friendName = obj[i].friendName;
                    var li_id = friendId + "li";
                    var tip_id = friendId + "tip";
                    var status_id = friendId + "status";
                    listFriend += '<li class="person" id="' + li_id + '" data-chat="' + friendId + '">' +
                        '<img id="hook"  src="' + image + '" alt="' + friendId + '" />' +
                        '<span class="name" style="margin-right: 10px">' + friendName + '</span><span class="status" id="' + status_id + '">' +
                        '</span><span class="tip" id="' + tip_id + '"></span>' +
                        '</li>';
                    chatWindowDivs = '<div style="" class="chat" id="' + friendId + '" data-chat="' + friendId + '"></div>';
                    $("#write").before(chatWindowDivs);
                }
                document.getElementById("people").innerHTML += listFriend;
                boolOnline(friendIds + " " + userId);
                init();
                friend_initFriend();
                initFriendAndChat();
            }
        }

        $("#hook,#msg-box").bind("mouseover", showMsgBox);

    };
    xmlHttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xmlHttp.send("userId=" + userId);

}


//同意好友添加请求
function acceptReq(reId) {

    var seId = $("#userIf").attr("alt");

    $.ajax({
        type: 'POST',
        url: '/friend/agree',
        dataType: 'text',
        data: {
            'friendId': reId,
            'userId': seId,
        },
        success: function (data) {
            var content = {
                "sendId": seId,    //发送同意信息到请求者，因此receiveId是真正的发送者
                "receiveId": reId,
                "content": agreeTAG
            };

            webSocket.send(JSON.stringify(content));
            $("#reValidte li[id=" + reId + "]").remove();

            $.ajax({              //好友列表添加此好友信息
                type: 'GET',
                url: '/friend/get',
                dataType: 'JSON',
                data: {
                    'userId': seId,
                    'friendId': reId
                },
                success: function (data) {

                    var info = "";
                    var listFriend = '';
                    var friendId = data.friendId;
                    var image = data.image;
                    var friendName = data.friendName;
                    var groupId = data.groupId;
                    var li_id = friendId + "li";
                    var tip_id = friendId + "tip";
                    var status_id = friendId + "status";

                    info += '<li class="person" id="' + li_id + '" data-chat="' + friendId + '">' +
                        '<img id="hook"  src="' + image + '" alt="' + friendId + '" />' +
                        '<span class="name" style="margin-right: 10px">' + friendName + '</span> <span class="status" id="' + status_id + '">' + "[在线]" +
                        '</span><span class="tip" id="' + tip_id + '"></span>' +
                        '</li>';

                    listFriend += '<li style="display: none" class="friend_person"  data-chat="' + friendId + '" id="' + friendId + '" alt="' + friendId + '">' +
                        '<img id="friend_hook"  src="' + image + '" alt="' + friendId + '" />' +
                        '<span class="friend_name">' + friendName + '</span>' +
                        '<p style="display: none">' + groupId + '</p>' +
                        '</li>';

                    var chatWindowDivs = '<div style="" class="chat" id="' + friendId + '" data-chat="' + friendId + '"></div>';
                    $("#write").before(chatWindowDivs);

                    document.getElementById("people").innerHTML += info;
                    document.getElementById("friend_people").innerHTML += listFriend;
                    $(".friend_person").bind("mousedown", showFriendMsgBox);
                    $("#hook,#msg-box").bind("mouseover", showMsgBox);
                    initFriendAndChat();
                }
            });
        }
    });
}


//拒绝好友添加请求
function refuseReq(reId) {

    var seId = $("#userIf").attr("alt");

    $.ajax({
        type: 'POST',
        url: '/friend/delete',
        dataType: 'text',
        data: {
            'friendId': reId,
            'userId': seId
        },
        success: function (data) {

            var content = {
                "sendId": seId,    //发送拒绝信息到请求者，
                "receiveId": reId,
                "content": refuseTAG
            };
            webSocket.send(JSON.stringify(content));
            //  window.console.info("拒绝发送内容：" + content.content);
            $("#reValidte li[id=" + reId + "]").remove();

        }
    });
}


//返回webSocket对象
function getWebSocket() {


    console.log("getWebSocket方法中的的sendId:" + $(".active").attr("data-chat"))
    var webSocket = new WebSocket("ws://8.136.3.120:8080/chatRoom/" + document.getElementById("userIf").alt);

    webSocket.onopen = function (ev) {
        console.log("用户打开了连接");
    };

    webSocket.onclose = function (ev) {
        console.log("用户关闭了连接")
    };

    webSocket.onerror = function (ev) {
        alert("发生了错误")
    };

    webSocket.onmessage = function (ev) {  //当有好友发送消息时进行消息的显示

        console.info("data:" + ev.data);
        console.info("ev:" + ev);

        if (ev.data.trim().length <= 15) {
            var status_id = ev.data.split(" ")[0] + "status";
            if (ev.data.split(" ")[1] == "loginIn") {
                document.getElementById(status_id).innerText = "[在线]";
                if ($(".active").attr("data-chat") == ev.data.split(" ")[0]) $(".right .top .status").text("在线");
            } else {
                document.getElementById(status_id).innerText = "[离线]";
                if ($(".active").attr("data-chat") == ev.data.split(" ")[0]) $(".right .top .status").text("离线");
            }
        } else {
            var obj1 = JSON.parse(ev.data);
            var sendId1 = obj1.sendId;
            var msg1 = obj1.content;

            if (msg1 == requestTAG || msg1 == agreeTAG || msg1 == refuseTAG || msg1 == deleteTAG) {

                console.info("进入判断事件：" + msg1);
                if (msg1 == requestTAG) {

                    $.ajax({              //获取已发送请求的好友信息
                        type: 'GET',
                        url: '/user/getId',
                        dataType: 'JSON',
                        data: {
                            'id': sendId1              //目前为接受者，因此sendId是请求者
                        },
                        success: function (data) {

                            var reValidte = '';
                            var id = data.id;
                            var image = data.image;
                            var userName = data.userName;
                            reValidte += '<li class="person" id="' + id + '">\n' +
                                '<img src="' + image + '" alt="' + id + '" style="width: 45px;height: 45px;border-radius: 100%;overflow: hidden"/>\n' +
                                '<span class="name">帐号：' + id + ' 用户名：' + userName + '</span>\n' +
                                '<span style="color: green"  onclick="acceptReq(' + id + ')">√</span>\n' +
                                '<span style="color: red" onclick="refuseReq(' + id + ')">×</span>\n' +
                                '</li>';
                            document.getElementById("reValidte").innerHTML += reValidte;
                        }
                    });
                }
                if (msg1 == agreeTAG) {    //接收到好友请求同意消息

                    var seId = $("#userIf").attr("alt");

                    window.console.info(sendId1 + "已同意你的请求");
                    $("#sendValidate li[id=" + sendId1 + "]").remove();


                    $.ajax({              //好友列表添加此好友信息
                        type: 'GET',
                        url: '/friend/get',
                        dataType: 'JSON',
                        data: {
                            'userId': seId,
                            'friendId': sendId1
                        },
                        success: function (data) {

                            var info = "";
                            var listFriend = '';
                            var friendId = data.friendId;
                            var image = data.image;
                            var friendName = data.friendName;
                            var groupId = data.groupId;
                            var li_id = friendId + "li";
                            var tip_id = friendId + "tip";
                            var status_id = friendId + "status";

                            info += '<li class="person" id="' + li_id + '" data-chat="' + friendId + '">' +
                                '<img id="hook"  src="' + image + '" alt="' + friendId + '" />' +
                                '<span class="name" style="margin-right: 10px">' + friendName + '</span> <span class="status" id="' + status_id + '">' + "[在线]" +
                                '</span><span class="tip" id="' + tip_id + '"></span>' +
                                '</li>';

                            listFriend += '<li style="display: none" class="friend_person"  data-chat="' + friendId + '" id="' + friendId + '" alt="' + friendId + '">' +
                                '<img id="friend_hook"  src="' + image + '" alt="' + friendId + '" />' +
                                '<span class="friend_name">' + friendName + '</span>' +
                                '<p style="display: none">' + groupId + '</p>' +
                                '</li>';

                            var chatWindowDivs = '<div style="" class="chat" id="' + friendId + '" data-chat="' + friendId + '"></div>';
                            $("#write").before(chatWindowDivs);


                            document.getElementById("people").innerHTML += info;
                            document.getElementById("friend_people").innerHTML += listFriend;
                            $(".friend_person").bind("mousedown", showFriendMsgBox);
                            $("#hook,#msg-box").bind("mouseover", showMsgBox);
                            initFriendAndChat()
                        }
                    });
                }

                if (msg1 == refuseTAG) {   //接收到好友请求拒绝消息
                    window.console.info(sendId1 + "已拒绝你的请求");
                    $("#sendValidate li[id=" + sendId1 + "]").remove();
                }

                if (msg1 == deleteTAG) {   //接收好友删除消息
                    window.console.info(sendId1 + "已删除你的");
                    // alert("被删除好友的Id:"+sendId1);
                    $("#people li[id=" + sendId1 + "li]").remove();
                    $("#friend_people li[id=" + sendId1 + "]").remove();
                    $(".chat,#" + sendId1).remove();
                    initFriendAndChat()
                }
            } else {
                var obj = JSON.parse(ev.data);
                var sendId = obj.sendId;
                var receiveId = obj.receiveId;
                var createTime = obj.createTime.substring(0, 19);
                var content = obj.content;
                document.getElementById("sound").play();
                if ($(".active").attr("data-chat") == sendId) {  //如果此时，正好打开了与发送消息的好友的窗口,直接显示
                    var time = document.getElementById($(".active").attr("data-chat")).getElementsByClassName("conversation-start");
                    var lastTime;
                    if (time.length == 0) lastTime = "2010-12-22 11:08:29";
                    else lastTime = time[time.length - 1].innerText;
                    if (judgeShowTime(createTime, lastTime)) {
                        if (boolToday(createTime))
                            $(".active-chat").append('<div class=\"conversation-start\"><span>' + createTime.split(" ")[1] + '</span></div>');
                        else
                            $(".active-chat").append('<div class=\"conversation-start\"><span>' + createTime + '</span></div>');
                    }
                    $(".active-chat").append("<div class='bubble you'>" + content + "</div>")
                } else { //如果此时没有打开与发送消息好友的窗口,则给出提醒

                    var li_id = sendId + "li";
                    var person = document.getElementById(li_id);
                    var tip_id = sendId + "tip";
                    var tip = document.getElementById(tip_id);
                    var status_id = sendId + "status";
                    var status = document.getElementById(status_id).innerText;
                    var unread;
                    if (tip.innerText == "") unread = 1;
                    else unread = parseInt(tip.innerText) + 1;
                    var img_url = person.getElementsByTagName("img")[0].getAttribute("src");
                    var friendName = person.getElementsByTagName("span")[0].innerText;
                    $("#people").prepend('<li class="person" data-chat="' + sendId + '" id="' + li_id + '">' +
                        '<img src="' + img_url + '" alt ="' + receiveId + '"/><span class="name">' + friendName + '</span><span class="status" id="' + status_id + '">' + status + '</span><span class="tip" ' +
                        'id="' + tip_id + '" style="visibility: visible">' + unread + '</span></li> ')
                    person.parentNode.removeChild(person);
                    initFriendAndChat();
                }
            }
        }
    };
    return webSocket;
}


function setActiveChat(f) {
    friends.list.querySelector('.active').classList.remove('active');//选择处于active状态的person，并消除刚刚点击的person的active状态
    f.classList.add('active');
    chat.current = chat.container.querySelector('.active-chat');//使显示的chat处于active-chat状态
    chat.person = f.getAttribute('data-chat');//使person为选中的data-chat
    receiveId = chat.person; //接收者的ID
    initChatRecord(receiveId);
    chat.current.classList.remove('active-chat');//消除chat的active-chat状态
    chat.container.querySelector('[data-chat="' + chat.person + '"]').classList.add('active-chat');//使聊天框中显示选中的person的active-chat
    friends.name = f.querySelector('.name').innerText;//获得聊天对象的name
    chat.name.innerHTML = friends.name;
    $(".right .top .status").text($(".active .status").text().substring(1, 3))
    f.querySelector(".tip").style.visibility = "hidden";
    f.querySelector(".tip").innerText = "";
}


//好友管理界面  好友列表
//初始化第二页好友列表
function friend_initFriend() {

    var friend_userId = document.getElementById("friend_userIf").alt;
    var friendIds = "";
    xmlHttp.open("POST", "/friend/getAll", true);
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4) {
            if (xmlHttp.status == 200) {
                var data = xmlHttp.responseText;
                var obj = JSON.parse(data);
                var listFriend = '';
                var status_id = friendId + "status";
                for (var i in obj) {
                    var friendId = obj[i].friendId;
                    friendIds += friendId + " ";
                    var groupId = obj[i].groupId;
                    var image = obj[i].image;
                    var friendName = obj[i].friendName;
                    listFriend += '<li style="display: none" class="friend_person"  data-chat="' + friendId + '" id="' + friendId + '" alt="' + friendId + '"  >' +
                        '<img id="friend_hook"  src="' + image + '" alt="' + friendId + '" />' +
                        '<span class="friend_name">' + friendName + '</span><span class="status" id="' + status_id + '">' +
                        '<p style="display: none">' + groupId + '</p>' +
                        '</li>';
                }
                document.getElementById("friend_people").innerHTML += listFriend;
            }
        }
        $(".friend_person").bind("mousedown", showFriendMsgBox);
    };
    xmlHttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xmlHttp.send("userId=" + friend_userId);
}

//进行相关信息的初始化,并连接服务器
function init() {
    document.querySelector('.person').classList.add('active');//使person处于选中状态
    document.querySelector('.chat').classList.add('active-chat');//选择person处于正在聊天状态
    $(".right .top .name").text($(".active .name").text());
    $(".right .top .status").text($(".active .status").text().substring(1, 3));

    sendId = $("#userIf").attr("alt"); //获取当前登录用户的userID
    receiveId = $(".active").attr("data-chat"); //获取接收者的ID
    console.log("这是init()方法中的sendId和receiveId:" + sendId + " " + receiveId);
    initChatRecord(receiveId);


    $(".chat").click(function () {
        $("#expression").css("visibility", "hidden");
        $("#expressionPackage").css("visibility", "hidden");
    });


    //显示聊天记录
    $("#history").click(function () {
        var sendId = $("#userIf").attr("alt");
        var receiveId = $(".active").attr("data-chat");
        $("table").html("");

        $.ajax({
            url: "/chatRoom/upload/record",
            data: "sendId=" + sendId + "&receiveId=" + receiveId,
            type: "POST",
            success: function (ev) {
                var userName = ev.split(" ")[0];
                var receiveName = $(".active .name").text();
                var path = "http://8.136.3.120:8080" + ev.split(" ")[1];
                var obj = jQuery.parseJSON(ev.substring(24, ev.length));
                var year_month_day;
                for (var i in obj) {
                    var send = obj[i].sendId;
                    var content = obj[i].content;
                    var sendTime = obj[i].createTime;
                    var time = sendTime.split(" ")[1];
                    if (sendTime.split(" ")[0] != year_month_day) {
                        document.getElementById("historyTable").innerHTML += '<tr class="NYR"><td><span>' + sendTime.split(" ")[0] + '</span></td></tr>' + '<hr style="background-color: grey;width: 100%">';
                        year_month_day = sendTime.split(" ")[0];
                    }
                    if (send == sendId) //该条信息是我发给好友的
                        document.getElementById("historyTable").innerHTML += '<tr class="name_time"><td><span style="color:deepskyblue ">' + userName + '&nbsp;&nbsp;&nbsp;' + time + '</span></td></tr>';
                    else //这条信息是好友发给我的
                        document.getElementById("historyTable").innerHTML += '<tr class="name_time"><td><span style="color: green">' + receiveName + '&nbsp;&nbsp;&nbsp;' + time + '</span></td></tr>';
                    document.getElementById("historyTable").innerHTML += '<tr class="message"><td><span>' + content + '</span></td></tr>';
                }
                alert(path);
                alert(ev.split(" ")[1])
                $("#download").attr({
                    "href": path,
                    "download": ev.split(" ")[1]
                })

            }
        })
    });


    //用户与服务器进行连接
    var webSocket = getWebSocket();

    //用户发送自己的图片
    $("#inputImage").change(function () {
        var file = document.getElementById("inputImage").files[0];
        if (file == null) return;
        var formData = new FormData();
        formData.append("file", file);
        formData.append("sendId", sendId);
        formData.append("receiveId", receiveId);
        $.ajax({
            url: "/chatRoom/upload/picture",
            type: "POST",
            data: formData,
            contentType: false,
            processData: false,
            success: function (ev) {
                $(".div-textarea").html("<img class='userImg chatPicture' src=" + ev + ">");
                $("#chat-fasong").click();
            }
        })
    })


    //发送功能
    $("#chat-fasong").click(function () {
        var textContent = $(".div-textarea").html().replace(/[\n\r]/g, '<br>')
        if (textContent != "") {
            var msg = $(".div-textarea").html();
            var content = {
                "sendId": $("#userIf").attr("alt"),
                "receiveId": $(".active").attr("data-chat"),
                "content": $(".div-textarea").html()
            };
            webSocket.send(JSON.stringify(content));
            $.ajax({
                url: "/chatRoom/send",
                type: "post",
                data: JSON.stringify(content),
                contentType: "application/json;charset=utf-8",
                success: function (ev) {
                    var time = document.getElementById($(".active").attr("data-chat")).getElementsByClassName("conversation-start");
                    var lastTime;
                    if (time.length == 0) lastTime = "2010-12-22 11:08:29";
                    else lastTime = time[time.length - 1].innerText;
                    var currentTime = ev.trim().substring(0, 19);
                    if (judgeShowTime(currentTime, lastTime))
                        if (boolToday(currentTime)) {
                            $(".active-chat").append('<div class=\"conversation-start\"><span>' + currentTime.split(" ")[1] + '</span></div>');
                        } else $(".active-chat").append('<div class=\"conversation-start\"><span>' + currentTime + '</span></div>');
                    $(".active-chat").append("<div class='bubble me'>" + msg + "</div>")
                    //发送后清空输入框
                    $(".div-textarea").html("");
                }
            })
        } else {
            alert("发送内容不能为空");
        }
    });

    //语音发送功能
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({
            "audio": true
        })
            .then(function (value) {
                var mediaRecorder = new MediaRecorder(value);
                var start, end;
                var chunks = [];

                $("#chat-audio").mousedown(function () {
                    start = new Date();
                    mediaRecorder.start();
                    $(this).css({
                        "width": "44px",
                        "height": "40px",
                        "top": "2px",
                        "left": "374px"
                    })
                });

                mediaRecorder.ondataavailable = function (ev) {
                    chunks.push(ev.data)
                };

                $("#chat-audio").mouseup(function () {
                    end = new Date();
                    mediaRecorder.stop();
                    $(this).css({
                        "width": "22",
                        "height": "20px",
                        "left": "384px",
                        "top": "12px"
                    })
                });

                mediaRecorder.onstop = function (ev) {
                    if (end.getTime() - start.getTime() < 1000) {
                        alert("录音时间过短");
                    } else {
                        var blob = new Blob(chunks, {"type": 'audio/mp3;codecs=opus'})
                        var formData = new FormData();
                        formData.append("audio", blob);
                        formData.append("sendId", sendId);
                        $.ajax({
                            url: "/chatRoom/upload/audio",
                            type: "POST",
                            data: formData,
                            contentType: false,
                            processData: false,
                            success: function (ev) {
                                var second = Math.round((end.getTime() - start.getTime()) / 1000);
                                $(".div-textarea").html('<img class="soundImg" onclick="sound(this)" src="img/soundMsg.png" alt="' + ev + '">' + '<span style="margin-left: 10px">' + second + "</span>");
                                $("#chat-fasong").click();
                            }
                        })
                        chunks = [];
                    }
                }
            })
            .catch(function (reason) {
                alert("请打开录音权限")
            })
    }
}

//播放语音消息
function sound(img) {
    var soundURL = img.getAttribute("alt");
    $("#msgAudio").attr("src", soundURL);
    document.getElementById("msgAudio").play();
}


//点击哪位好友,生成其聊天记录
function initChatRecord(contactId) {
    var userId = $("#userIf").attr("alt");
    $.get("chatRoom/" + userId + "/" + contactId, function (data, status) {
        var obj = jQuery.parseJSON(data);
        var show = true;
        var openedChatWindow = document.getElementById(contactId);
        openedChatWindow.innerHTML = "";
        for (var i in obj) {
            var content = obj[i].content;
            var sendTime = obj[i].createTime;
            var sendId = obj[i].sendId;
            var receiveId = obj[i].receiveId;
            if (show) {
                if (boolToday(sendTime))
                    openedChatWindow.innerHTML += '<div class=\"conversation-start\"><span>' + sendTime.split(" ")[1] + '</span></div>';
                else
                    openedChatWindow.innerHTML += '<div class=\"conversation-start\"><span>' + sendTime + '</span></div>';
                show = false;
            }
            var time = document.getElementById(contactId).getElementsByClassName("conversation-start");
            var lastTime = time[time.length - 1].innerText;
            if (judgeShowTime(sendTime, lastTime))
                if (boolToday(sendTime))
                    openedChatWindow.innerHTML += '<div class=\"conversation-start\"><span>' + sendTime.split(" ")[1] + '</span></div>';
                else
                    openedChatWindow.innerHTML += '<div class=\"conversation-start\"><span>' + sendTime + '</span></div>';

            if (userId == sendId)
                openedChatWindow.innerHTML += '<div class=\"bubble me\">' + content + '</div>';
            else
                openedChatWindow.innerHTML += '<div class=\"bubble you\">' + content + '</div>';
        }
    })
}

//判断时间是否需要显示,此次发送时间与上一次显示的时间间隔3分钟以上就返回true,并进行时间的显示
function judgeShowTime(currentTime, pastTime) {
    var reg = new RegExp("[^0-9]");
    var current = currentTime.trim().split(reg);
    var past = pastTime.trim().split(reg)
    var current_year = parseInt(current[0]);
    var current_month = parseInt(current[1]);
    var current_day = parseInt(current[2]);
    var current_hour = parseInt(current[3]);
    var current_minute = parseInt(current[4]);
    var current_second = parseInt(current[5]);

    if (pastTime.length == 19) {
        var past_year = parseInt(past[0]);
        var past_month = parseInt(past[1]);
        var past_day = parseInt(past[2]);
        var past_hour = parseInt(past[3]);
        var past_minute = parseInt(past[4]);
        var past_second = parseInt(past[5]);
        if (current_year > past_year || current_month > past_month || current_day > past_day || current_hour > past_hour) return true;
        else if ((current_minute * 60 + current_second) >= (past_minute * 60 + past_second + 180)) return true;
        else return false;
    } else {
        var past_hour = parseInt(past[0]);
        var past_minute = parseInt(past[1]);
        var past_second = parseInt(past[2]);
        if (current_hour > past_hour) return true;
        else if ((current_minute * 60 + current_second) >= (past_minute * 60 + past_second + 180)) return true;
        else return false;
    }
}

//判断是否为当天,如果是当天的话,返回false,不显示年月日
function boolToday(time) {
    var reg = new RegExp("[^0-9]");
    var time_array = time.split(reg);
    var date = new Date();
    return (time_array[0] == date.getFullYear() && time_array[1] == date.getMonth() + 1 && time_array[2] == date.getDate());
}

//返回好友的在线情况
function boolOnline(friend_id) {
    console.log("boolOnline()方法中的friend_id:" + friend_id)
    $.ajax({
        url: "/chatRoom/status",
        type: "POST",
        data: "friend_id=" + friend_id,
        data_type: "json",
        async: false,
        success: function (ev) {
            var friendIds = friend_id.trim().split(" ");
            var status = ev.split(" ");
            for (var i = 0; i < friendIds.length - 2; i++) {
                var status_id = friendIds[i].trim() + "status";
                if (status[i] == "true") {
                    document.getElementById(status_id).innerText = "[在线]";
                } else {
                    document.getElementById(status_id).innerText = "[离线]";
                }
            }
        }
    })
}

/*function downloadRecord() {
    var sendId = $("#userIf").attr("alt");
    var receiveId = $(".active").attr("data-chat");

    $.ajax({
        url:"/chatRoom/upload/record",
        data: "sendId="+sendId+"&receiveId="+receiveId,
        type: "POST",
        success: function (ev) {
            alert(ev);
            $("#download").attr({
                "href":"http://8.136.3.120:8080"+ev,
                "download":ev
            })
            $("#download").click();
            console.log("http://8.136.3.120:8080"+ev);
        }

    })
}*/
