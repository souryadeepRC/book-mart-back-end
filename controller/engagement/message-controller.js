const UserBuddy = require("../../model/UserBuddy");

module.exports.getMessageBuddies = async (req, res) => {
  const buddies = await UserBuddy.findOne({
    userId: req.userId,
  }).select("buddyList buddyMessages -_id");

  const isBuddyPresent = buddies?.buddyList?.length > 0;

  let buddy = undefined;
  let messages = [];
  if (isBuddyPresent) {
    buddy = buddies?.buddyList?.[0];
    messages = buddies?.buddyMessages?.[0]?.messages;
  }

  res.status(200).json({
    messageBuddies: buddies?.buddyList,
    activeBuddyMessage: {
      buddy,
      messages,
    },
  });
};
