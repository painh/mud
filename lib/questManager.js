var Quest = function(questId)
{
    this.questId = questId;
};

var QuestManager = function () {
    this.list = {};
};

QuestManager.prototype.GetById = function (questId) {
    if (!this.list[questId])
        return false;

    return this.list[questId];
};

module.exports = function () {
    return new QuestManager();
};