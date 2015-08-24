// YOUR CODE HERE:
var app;

$(function() {
  app = {
    server: 'https://api.parse.com/1/classes/chatterbox/',
    username: 'anonymous', //default values
    roomname: 'lobby',
    friends: {},

    init: function(){
      //get the username saved in the window object by prompt
      app.username = window.location.search.substr(10);
      
      // jQuery selectors 
      // note the naming convention
      app.$main = $('#main');
      app.$message = $('#message');
      app.$chats = $('#chats');
      app.$roomSelect = $('#roomSelect');
      app.$send = $('#send');

      // listeners

      // fetch prev messages
      app.fetch(false);

      //auto fetch messages
      setInterval(app.fetch, 5000);
    },

    send: function(data) {
      //clear message box 
      app.$messages.val('');

      //ajax call to server for sending messages
      $.ajax({
        url: app.server,
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function(data) {
          console.log('chatterbox: Message sent!');
          //immediately fetch data after posting
          app.fetch();
        }, 
        error: function(data) {
          console.log('chatterbox: Failed to send message');
        }
      });
    },

    fetch: function(animate) {
      //ajax call to server to get data
      $ajax({
        url: app.server,
        type: 'GET',
        contentType: 'application/json',
        data: { order: '-createdAt'},
        success: function(data) {
          console.log('chatterbox: Messages fetched');
          app.populateRooms(data.results);
          app.populateMessages(data.results, animate);
        },
        error: function(data) {
          console.log('chatterbox: failed to retrieve message');
        }
      });
    },

    clearMessages: function() {
      app.$chats.html('');
    },
    populateMessages: function(results) {
      // first clear messages
      app.clearMessages();
      if(Array.isArray(results)) {
        results.forEach(app.addMessages);
      }

    },
    populateRooms: function(results){
      app.$roomSelect.html('<option value="__newRoom">New room...</option><option value="" selected>Lobby</option></select>');
      if (results) {
        var rooms = {};
        results.forEach(function(data) {
          var roomname = data.roomname;
          if (roomname && !rooms[rommname]) {
            app.addRooms(roomname);
            // flag to keep track of rooms
            rooms[roomname] = true;
          }
        });
      }

      app.$roomSelect.val(app.roomname)
    },

    addRooms: function(roomname) {
      var $option = $('<option/>').val(roomname).text(roomname);

      app.$roomSelect.append($option);
    },

    addMessages: function(data) {
      if(!data.roomname)
        data.roomname = 'lobby';

      if(data.roomname === app.roomname){
        //chats live here
        var $chat = $('<div class ="chat"/>');
        var $username = $('<span class="username"/>');
        $username.text(data.username+': ').attr('data-username', data.username).attr('data-roomname',data.roomname).appendTo($chat);
        
        if (app.friends[data.username] === true)
          $username.addClass('friend');

        var $message = $('<br><span/>');
        $message.text(data.text).appendTo($chat);

        app.$chats.append($chat);
      }
    },

    addFriend: function(evt) {
      //evt.currentTarget

      var username = $(evt.currentTarget).attr('data-username');

      if (username !== undefined) {
        console.log('chatterbox: adding %s as a friend!', username);
        app.friends[username] = true;

        //bold past messages
        var $usernames = $(selector).addClass('friend');
      }

    },

    saveRoom: function(evt) {
      var selectIndex = app.$roomSelect.prop('selectedIndex');
      // New room is always the first option
      if (selectIndex === 0) {
        var roomname = prompt('Enter room name');
        if (roomname) {
          app.roomname = roomname;
          app.addRoom(roomname);

          app.$roomSelect.val(roomname);

          //fetch messages
          app.fetch();
        }
      }
      else {

        app.roomname = app.$roomSelect.val();
        // Fetch messages again
        app.fetch();
      }

    },
    handleSubmmit: function(evt) {
      var message = {
        username: app.username,
        text: app.$message.val(),
        roomname: app.roomname || 'lobby'
      };
      app.send(message);
      evt.preventDefault();
    }
  };
}());

