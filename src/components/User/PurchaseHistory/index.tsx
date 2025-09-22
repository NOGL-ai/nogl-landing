import React from "react";
import PurchaseEmptyState from "./PurchaseEmptyState";
import PurchaseTable from "./PurchaseTable";
import { isAuthorized } from "@/libs/isAuthorized";
import { pricingData } from "@/pricing/pricingData";

const PurchaseHistory = async () => {
	const user = await isAuthorized();
	const purchasedPlan = pricingData.find(
		(plan) => plan.priceId === user?.priceId
	);

	if (!user) return null;

	const billingDate: any =
		user.currentPeriodEnd && new Date(user.currentPeriodEnd);

	const isSubscribed =
		user.priceId &&
		user.currentPeriodEnd &&
		billingDate.getTime() + 86_400_000 > Date.now();

	const data = {
		unit_amount: purchasedPlan?.unit_amount,
		currentPeriodEnd: user?.currentPeriodEnd,
		subscriptionId: user?.subscriptionId,
		nickname: purchasedPlan?.nickname,
	};

	return (
		<>{isSubscribed ? <PurchaseTable data={data} /> : <PurchaseEmptyState />}</>
	);
};

export default PurchaseHistory;
