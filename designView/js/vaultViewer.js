

//모든 Vault폴더 정보 조회
function getRoot(){
  $.ajax({
      type:"get",
      url:"http://192.168.0.21/vaultservice/vaultservicerest.svc/getrootfolder ",
//            header:{"content-Type" : "application/json"},
      dataType : "json",

      success : function(data,status, xhr){
          try{
              var jsonString = JSON.stringify(data);
              rootFolder = JSON.parse(jsonString);
          } catch (err){
              alert(err + "가 발생 하였습니다!");
          }
          
        createTree();
        
        //  window.location.href = "./viewMain.html";  //window.location.replace()은 기존 페이지를 덮어 씌운다.
      //  }
      },error: function (e) {
          alert("error : " + e.message);
        //   $('#signup-btn').trigger('click');
        //  $(document).on('click','.signup-btn',function(e){
        //      btnFilter(e);
        //  });

        //  function btnFilter(e)
        //  {
        //      element = e.currentTarget.parentElement;
        //  }
      }
  });

};

//Vault폴더 트리 뷰 생성
function createTree(){

  try{
    $folderTree = $('#folder-tree').treeview({
      data: rootFolder,
      showBorder: false,
      levels: 1,
      expandIcon: 'fa fa-angle-right',
      collapseIcon: 'fa fa-angle-down',
      //nodeIcon: 'fa fa-folder',
      showTags: false,
      onNodeSelected: function(event, node) {
        //alert(node.tags + " Node is selected");
        //getFolder(node.tags)
        //debugger;
        checkTimeOut();
        //alert(node.nodeId + " Node is selected")
          if (node.nodeId === 0) {           
              var nodeElement = $('li[data-nodeid=' + node.nodeId + ']');
              nodeElement.find('.fa-angle-right, .fa-angle-down, svg').hide();
          } // js 0719
        if(node.nodes == undefined){
          //createNode(node);
        }else if(node.state.expanded == true){
            //collapseNode(node);
        } else {
            expandNode(node);
        }
        sessionStorage.setItem('FolderID', node.tags);  
        $("#load-container").load("viewFolder.html", function(responseTxt, statusTxt, xhr){
        });

        //var allNodes = updateSelectedNodes(node);
            //alert("All Nodes : " )
            //createTable(node.tags);
        //createTable(node.tags);
        
      }

    });
  }  
  catch (err){
    alert(err + '가 발생 하였습니다!')
  }  
  
};

function selectNode(foldId) {
    //alert('select node : ' + foldId)
    checkTimeOut();

    try{
        $('#folder-tree').treeview('selectNode', [ foldId, { silent: false } ]);

      }  
      catch (err){
        alert(err + '가 발생 하였습니다!')
      }      
}

function searchNode(folderName, folderId){
    //alert('search node')
    var results = $('#folder-tree').treeview('search', [ folderName, {
        ignoreCase: true,     // case insensitive
        exactMatch: true,    // like or equals
        //revealResults: false,  // reveal matching nodes
    }]);

    var nodeId = undefined;
    $.each(results, function (index, result) {
        if(folderId == result.tags) {
            //alert('nodeId : ' + result.nodeId );
            //return result.nodeId
            nodeId = result.nodeId;
            return false;            
        }           
    });

    if (nodeId != undefined){
        selectNode(nodeId)
    }
};

// function createNode(node) {
//     //$('#folder-tree').treeview('collapseNode', [ node.nodeId, { silent: true } ]);
//     //alert("Non " + node.text);
// }

// function collapseNode(node) {
//     $('#folder-tree').treeview('collapseNode', [ node.nodeId, { silent: true } ]);
//     //alert("collapse " + node.text);
// }

function expandNode(node) {
    $('#folder-tree').treeview('expandNode', [ node.nodeId, { levels: 1, silent: true } ]);
    //alert("expand " + node.text);
}

function updateSelectedNodes() {
  var selectedData = [];
  var nodes = $('#folder-tree').treeview('getUnselected');
  for (var i = 0; i < nodes.length; i++) {
      var node = getSelectedNodes(nodes[i]);
      if (node) {
          selectedData.push(node);
      }
  }
  //$('#result').text(JSON.stringify(selectedData, null, 2));
  return selectedData;
}

function getSelectedNodes(node) {
  var result = null;
  if (node.state.selected) {
      result = {
          text: node.text,
          nodes: []
      };
      if (node.nodes) {
          for (var i = 0; i < node.nodes.length; i++) {
              var child = getSelectedNodes(node.nodes[i]);
              if (child) {
                  result.nodes.push(child);
              }
          }
      }
      if (result.nodes.length === 0) {
          delete result.nodes;
      }
  } else if (node.nodes) {
      for (var i = 0; i < node.nodes.length; i++) {
          var child = getSelectedNodes(node.nodes[i]);
          if (child) {
              if (!result) {
                  result = {
                      text: node.text,
                      nodes: []
                  };
              }
              result.nodes.push(child);
          }
      }
  }
  return result;
}

// function getFolder(foldId) {
//   $.ajax({
//         type:"get",
//         url:"http://192.168.0.21/vaultservice/vaultservicerest.svc/getfolder?id= " + foldId + " ",
// //            header:{"content-Type" : "application/json"},
//         dataType : "json",

//         success : function(data,status, xhr){
//             try{
//                 var jsonString = JSON.stringify(data);
//             }
//             catch (err){
//                 alert(err + "가 발생 하였습니다!");
//             }
            
//         },error: function (e) {
//             alert("error : " + e.message);
//           //   $('#signup-btn').trigger('click');
//           //  $(document).on('click','.signup-btn',function(e){
//           //      btnFilter(e);
//           //  });

//           //  function btnFilter(e)
//           //  {
//           //      element = e.currentTarget.parentElement;
//           //  }
//       }
//     });
// }


//일반 사용자 암호 변경을 서버에 요청

function saveNewPassword() {
  //alert("save table data");
  //debugger;

  try {

    var password1 = $.trim($("#inputNewPassword1").val());
    if(password1 == "" || password1 == null) {
      alert("새 암호를 입력하여 주십시오.");
        $("#inputNewPassword1").trigger("focus");
        return false;
    }

    var password2 = $.trim($("#inputNewPassword2").val());
    if(password2 == "" || password2 == null) {
      alert("새 암호 확인을 입력하여 주십시오.");
        $("#inputNewPassword2").trigger("focus");
        return false;
    }

    if(password1 != password2) {
      alert("입력된 암호가 일치하지 않습니다.");
        $("#inputPassword1").trigger("focus");
        return false;
    }
   
    var userID = sessionStorage.getItem('UserID');
    var userPWD = sessionStorage.getItem('UserPWD');
    var adminUser = sessionStorage.getItem('AdminUser');

    //let userRole = {UserID:5, UserName:"appadmin", UserPWD:"1234", Roles};
    let newPassword = {UserName:userID, UserPWD:userPWD, NewUserPWD:password1, isAdminUser:adminUser};

    //var jsondata = JSON.stringify(newPassword);
    //alert(JSON.stringify(newPassword));
    //return false;

    $.ajax({
        type:"POST",
        url :"http://192.168.0.21/vaultservice/VaultServiceREST.svc/changeuserpwd",
        dataType:"json",
        data : JSON.stringify(newPassword),
        contentType:"application/json",
        async : true,
        success: function(data){
          if(data.ErrorCode == 0) {
            alert("완료");
            //createUserTable();
            //closeNewUserModal();
            logOut();
            return true;        
          } else {
            if(data.ErrorMSG.indexOf('143') != -1) {
              alert("이미 존재하는 사용자 ID입니다!");
              $("#inputNewPassword1").trigger("focus");
            } else {
              alert("오류 코드 : " + data.ErrorMSG);
            }
            
            return false;
          }
        },error: function (e) {
          alert("서버 오류 : " + e.message);
          return false;
        }
        
  });

  } catch (err){
    alert(err + "가 발생 하였습니다!");
  }     
};

//일반 사용자 암호 변경 모달 종료
function closeNewPasswordModal() {

  $('#inputNewPassword1').val("");
  $('#inputNewPassword2').val("");

  $("#newPasswordModal").modal('hide');
}



// function createTable(folderId) { 
//     //alert("create table");
    
//     $('#folderTable').bootstrapTable({
//        url:'http://192.168.0.21/vaultservice/VaultServiceREST.svc/getFolder?id='+ folderId ,
//        search: true,
//        columns: [
//           [{
//             title: '이름',
//             field: 'Name',
//             align: 'center',
//             valign: 'middle',
//             sortable: true,
//           }, {
//             title: '상태',
//             field: 'ID',
//             valign: 'middle',
//           }, {
//             title: '범주',
//             field: 'Type',
//             align: 'center',
//             valign: 'middle',
//             sortable: true,          
//           // }, {
//           //   title: 'Id',
//           //   field: 'ID',
//           //   align: 'center',
//           //   valign: 'middle',
//           //   sortable: true,          
//           }],
//         ]         
//       });
// }


function checkTimeOut() {
  var lastTimeStamp = JSON.parse(sessionStorage.getItem('LastTimeStamp'));

  if((Date.now() - lastTimeStamp)/1000 > 3600 ) {
     //alert('시간이 초과 되었습니다! \n'+'lasrt time :' + lastTimeStamp + ' --- Now Time : ' + Date.now());
    alert('연결 시간이 초과 되었습니다!');
    logOut();
  }

}

function logOut(){ 
  sessionStorage.removeItem('UserID');
  sessionStorage.removeItem('UserPWD');
  sessionStorage.removeItem('FolderID');
  sessionStorage.removeItem('LastTimeStamp');
  window.location.replace("index.html");
  e.preventDefault();
};

     //로그 아웃
     $("#logout-btn").click(function(e){
      sessionStorage.removeItem('UserID');
      sessionStorage.removeItem('UserPWD');
      sessionStorage.removeItem('FolderID');
      window.location.href = "index.html";
      e.preventDefault();
  });
  $("#smlogout-btn").click(function(e){
      sessionStorage.removeItem('UserID');
      sessionStorage.removeItem('UserPWD');
      sessionStorage.removeItem('FolderID');
      window.location.href = "index.html";
      e.preventDefault();
  });