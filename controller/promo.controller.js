const { promoService, usersService } = require("../service")
const { sendNotification } = require("../utils/onesignal")
const { successResponse, errorResponse } = require("../utils/responder")

exports.getPromo = async (req, res, next) => {
    try {
        const data = await promoService.getPromo()
        successResponse(res, data)
    } catch (error) {
        errorResponse(res, error)
    }
}

exports.claimRewards = async (req, res, next) => {
    try {
        const data = await promoService.claimRewardsByReferral(req.userId)
        const totalRef = 2
        var reminder = totalRef - data.totalDocs
        if (data.totalDocs >= totalRef) {
            await promoService.updateRewards({}, { $addToSet: { 'rewards.applied': req.userId } })
            successResponse(res, { message: 'You have claimed your rewards successfully. Click "View Rewards" to view your reward' })
            const notUsers = await usersService.getUsers({ email: { $in: ['habibmail31@gmail.com'] } });
            var include_player_ids = notUsers.docs?.map?.(u => u.oneSignalId)
            sendNotification({
            headings: { "en": `Congratulations!` },
            contents: { "en": `Hi ${req.firstName}, You have unlocked your rewards successfully. Click "View Rewards" to view your reward` },
            include_subscription_ids: [req.oneSignalId, ...include_player_ids],
            url: 'gadgetsafrica://profile',
            })
        } else throw Error(`You have ${data.totalDocs} referrals. Invite ${reminder} more`)
    } catch (error) {
        errorResponse(res, error)
    }
} 