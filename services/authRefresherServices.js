const model = require('../models/index');
const RestClient = require('../restclient/index');
const Logger = require('../helper/Logger');

const MemberCardAuthTokens = model.MemberCardsAuthToken.Get;
const MemberCards = model.MembersCards.Get;
const LoyaltyMemberCards = model.LoyaltyMemberCards.Get;
const Loyalty = model.Loyalty.Get;

const logger = Logger.RefreshAuth;

MemberCardAuthTokens.hasMany(MemberCards, {
	foreignKey: 'id',
	sourceKey: 'member_cards_id',
});

MemberCards.hasMany(LoyaltyMemberCards, {
	foreignKey: 'member_cards_id',
	sourceKey: 'id',
	onDelete: 'CASCADE',
});

module.exports = class AuthRefresher {
	static async refresh() {
		const currentDate = new Date();
		const values = await MemberCardAuthTokens.findAll({
			include: [
				{
					model: MemberCards,
					include: [
						{
							model: LoyaltyMemberCards,
							include: [
								{
									model: Loyalty,
								},
							],
						},
					],
				},
			],
		});

		values.forEach((value) => {
			try {
				const type = value.type_auth;
				const val = JSON.parse(value.auth_value);
				const loyalty = value.member_cards[0].loyalty_has_member_cards[0].loyalties[0];
				const apiRefreshToken = JSON.parse(loyalty.api_refresh_token);

				let expiresAt = null;

				switch (type) {
				case 'oauth2':
					expiresAt = new Date(val.expires_at.value);
					break;

				default:
					break;
				}

				if (expiresAt != null) {
					if (currentDate.getTime() < expiresAt.getTime()) {
						logger.info('Token not expired yet', value.id, loyalty.name);
						return 1;
					}
				}

				if (apiRefreshToken) {
					const restclient = new RestClient(apiRefreshToken);
					const authValue = {};
					switch (type) {
					case 'oauth2':
						authValue.refresh_token = val.refresh_token.value;
						restclient.changeHeader('Authorization', `Bearer ${val.token.value}`);
						break;

					default:
						break;
					}

					restclient.insertBody(authValue);

					restclient.request().then((response) => {
						if (response.status) {
							if (Object.prototype.hasOwnProperty.call(response, 'data')) {
								value.update({
									auth_value: JSON.stringify(response.data),
								});
							}
						}
					});
				}
			} catch (err) {
				logger.error(err);
			}
			return 0;
		});
	}
};
