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
import ExpandableContent from 'Component/ExpandableContent';

import './CartPage.style';

export class CartPageComponentPlugin {
    /**
     * Render total details
     * @param args
     * @param callback
     * @param instance
     * @returns {*}
     */
    aroundRenderTotalDetails = (args, callback = () => {}, instance) => (
            <>
                { callback.apply(instance, args) }
                { this._renderDiscountBreakdowns.bind(instance)() }
            </>
    );

    /**
     * Render discount
     * @param args
     * @param callback
     * @param instance
     * @returns {*}
     */
    aroundRenderDiscount = (args, callback = () => {}, instance) => {
        const {
            totals: {
                coupon_code,
                discount_amount = 0,
                discount_breakdowns: {
                    discount_breakdowns_enabled = false
                }
            }
        } = instance.props;

        if (discount_breakdowns_enabled) {
            return null;
        }

        if (!discount_amount) {
            return callback.apply(instance, args);
        }

        return (
            <>
                <dt>
                    { __('Discount ') }
                    { coupon_code && (
                        <strong block="CartPage" elem="DiscountCoupon">
                            &#40;
                            { coupon_code.toUpperCase() }
                            &#41;
                        </strong>
                    ) }
                </dt>
                <dd>{ `-${ instance.renderPriceLine(Math.abs(discount_amount)) }` }</dd>
            </>
        );
    };

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
                    discount_breakdowns_enabled = false,
                    discounts = []
                }
            }
        } = this.props;

        if (discounts && !discounts.length) {
            return null;
        }

        const totalDiscount = `-${ this.renderPriceLine(Math.abs(discount_amount)) }`;

        if (!discount_breakdowns_enabled) {
            return null;
        }

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
                            { `-${ this.renderPriceLine(Math.abs(rule_amount.replace(quote_currency_code, ''))) }` }
                        </dd>
                    </dl>
                )) }
            </ExpandableContent>
        );
    }
}

export const { aroundRenderTotalDetails, aroundRenderDiscount } = new CartPageComponentPlugin();

export default {
    'Route/CartPage/Component': {
        'member-function': {
            renderTotalDetails: [
                {
                    position: 100,
                    implementation: aroundRenderTotalDetails
                }
            ],
            renderDiscount: [
                {
                    position: 100,
                    implementation: aroundRenderDiscount
                }
            ]
        }
    }
};
