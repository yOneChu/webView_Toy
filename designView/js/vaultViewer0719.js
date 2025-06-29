// function hello() {
//     alert("Hello in files")
// }

//$(document).ready(function (){

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

// $("#userRole-btn").click(function(){
//   $("#load-container").load("viewAllUser.html", function(responseTxt, statusTxt, xhr){
// //				$(location).attr("href", "#draft-letter");
//             $(window).scrollTop(0);
//   });
// });
    // $("#load-container").load("viewFolder.html", function(responseTxt, statusTxt, xhr){
    // });

//     $("#draft-userRole-sidebtn").click(function(){
//       $("#load-container").load("viewAllUser.html", function(responseTxt, statusTxt, xhr){
// //				$(location).attr("href", "#draft-letter");
//                 $(window).scrollTop(0);
//       });
//     });



   

    //트리 뷰
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

    function getFolder(foldId) {
      $.ajax({
            type:"get",
            url:"http://192.168.0.21/vaultservice/vaultservicerest.svc/getfolder?id= " + foldId + " ",
//            header:{"content-Type" : "application/json"},
            dataType : "json",

            success : function(data,status, xhr){
                try{
                    var jsonString = JSON.stringify(data);
                }
                catch (err){
                    alert(err + "가 발생 하였습니다!");
                }
                
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
    }



//});


function createTable(folderId) { 
    //alert("create table");
    
    $('#folderTable').bootstrapTable({
       url:'http://192.168.0.21/vaultservice/VaultServiceREST.svc/getFolder?id='+ folderId ,
       search: true,
       columns: [
          [{
            title: '이름',
            field: 'Name',
            align: 'center',
            valign: 'middle',
            sortable: true,
          }, {
            title: '상태',
            field: 'ID',
            valign: 'middle',
          }, {
            title: '범주',
            field: 'Type',
            align: 'center',
            valign: 'middle',
            sortable: true,          
          // }, {
          //   title: 'Id',
          //   field: 'ID',
          //   align: 'center',
          //   valign: 'middle',
          //   sortable: true,          
          }],
        ]         
      });
}




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