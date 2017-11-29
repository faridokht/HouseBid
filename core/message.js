var mysql = require("./db-connection").pool;

function getMessageByMessageId(messageId, callback) {
    mysql.getConnection(function(err, con) {
        var sql = "SELECT * FROM message WHERE message_id = " + messageId;
        console.log("Query to be executed: " + sql);
        con.query(sql, function (err, result) {
            if (err) callback(err, null);
            else callback(null, result);
        });
    });
}

function getMessagesByAgentId(agentId, callback) {
    mysql.getConnection(function(err, con) {
        // var sql = "SELECT * FROM user WHERE user_id = " + userId;
        var sql = "SELECT m.message_id, m.message, m.sender_id, u.name 'sender_name', listing_id, date FROM message m, user u WHERE m.listing_id IN (SELECT listing_id FROM listing WHERE agent_id = " + agentId + ") and u.user_id = sender_id ORDER BY m.sender_id";
        console.log("Query to be executed: " + sql);
        con.query(sql, function (err, result) {
            if (err) callback(err, null);
            else {
                var returnResult = new Array();

                var allIds = new Array();
                for (i = 0; i < result.length; i++) {
                    allIds.push(result[i].sender_id);
                }
                var idsSet = Array.from(new Set(allIds));

                for (i = 0; i < idsSet.length; i++) {
                    var groupOfMessages = new Array();
                    for (j = 0; j < result.length; j++) {
                        if(result[j].sender_id === idsSet[i]) {
                            groupOfMessages.push(result[j]);
                        }
                    }
                    returnResult.push(groupOfMessages);
                }
                callback(null, returnResult);
            }
        });
        con.release();
    });
}

function addMessage(message, callback) {
    mysql.getConnection(function(err, con) {
        var sql = "INSERT INTO message SET ?",
            values = {
                message: message.message,
                sender_id: message.senderId,
                listing_id: message.listingId
            };
        con.query(sql, values, function (err, result) {
            if (err) callback(err, null);
            else callback(null, result);
        });
        con.release();
    });
}

module.exports.addMessage = addMessage;
module.exports.getMessagesByAgentId = getMessagesByAgentId;
module.exports.getMessageByMessageId = getMessageByMessageId;