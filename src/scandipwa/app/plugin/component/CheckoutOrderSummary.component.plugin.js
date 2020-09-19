/**
 * ScandiPWA - Progressive Web App for Magento
 *
 * Copyright © Scandiweb, Inc. All rights reserved.
 * See LICENSE for license details.
 *
 * @license OSL-3.0 (Open Software License ("OSL") v. 3.0)
 * @package scandipwa/base-theme
 * @link https://github.com/scandipwa/base-theme
 */

import React from 'react';

import isMobile from 'Util/Mobile';
import { formatCurrency, roundPrice } from 'Util/Price';
import ExpandableContent from 'Component/ExpandableContent';

export class CheckoutBillingComponentPlugin {
    /**
     * Render discount breakdowns
     * @returns {*}
     * @private
     */
    _renderDiscountBreakdowns() {
        const {
            totals: {
                quote_currency_code,
                discount_amount,
                discount_breakdowns: {
                    discounts = []
                }
            }
        } = this.props;

        if (discounts && !discounts.length) {
            return null;
        }

        const totalDiscount = CheckoutBillingComponentPlugin._renderPriceLine(
            quote_currency_code,
            Math.abs(discount_amount)
        );

        return (
            <ExpandableContent
              heading={ __('Discounts (%s)', totalDiscount) }
              mix={ {
                  block: 'CartPage',
                  elem: 'DiscountBreakdowns'
              } }
            >
                { discounts.map(({ rule_amount, rule_name }) => (
                    <dl
                      block="CartPage"
                      elem="DiscountBreakdown"
                      aria-label={ rule_name }
                      mods={ { isMobile } }
                      key={ rule_name }
                    >
                        <dt>
                            <span block="CartPage" elem="DiscountCoupon">{ rule_name }</span>
                        </dt>
                        <dd>
                            { `-${ CheckoutBillingComponentPlugin._renderPriceLine(
                                quote_currency_code,
                                Math.abs(rule_amount.replace(quote_currency_code, ''))
                            ) }` }
                        </dd>
                    </dl>
                )) }
            </ExpandableContent>
        );
    }

    /**
     * Render price with currency
     * @param quote_currency_code
     * @param discount_amount
     * @returns {string}
     * @private
     */
    static _renderPriceLine = (quote_currency_code, discount_amount) => {
        const priceString = formatCurrency(quote_currency_code);

        return `${priceString}${roundPrice(Math.abs(discount_amount))}`;
    };

    /**
     * Render coupon code
     * @param args
     * @param callback
     * @param instance
     * @returns {*}
     */
    aroundRenderCouponCode = (args, callback, instance) => {
        const {
            totals: {
                coupon_code,
                discount_amount = 0,
                discount_breakdowns: {
                    discount_breakdowns_enabled = false
                }
            }
        } = instance.props;
        const original = callback.apply(instance, args);

        if (!discount_breakdowns_enabled) {
            return instance.renderPriceLine(
                -Math.abs(discount_amount),
                coupon_code ? __('Discount (%s):', coupon_code.toUpperCase()) : __('Discount:')
            );
        }

        if (!discount_amount) {
            return original;
        }

        return this._renderDiscountBreakdowns.apply(instance);
    };
}

export const { aroundRenderCouponCode } = new CheckoutBillingComponentPlugin();

export default {
    'Component/CheckoutOrderSummary/Component': {
        'member-function': {
            renderCouponCode: [
                {
                    position: 100,
                    implementation: aroundRenderCouponCode
                }
            ]
        }
    }
};
