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

export class CartOverlayComponentPlugin {
    /**
     * Render discount
     * @param args
     * @param callback
     * @param instance
     * @returns {*}
     */
    aroundRenderDiscount = (args, callback, instance) => {
        const {
            totals: {
                coupon_code,
                discount_amount = 0
            }
        } = instance.props;
        const original = callback.apply(instance, args);

        if (!discount_amount) {
            return original;
        }

        return (
            <dl
              block="CartOverlay"
              elem="Discount"
            >
                <dt>
                    { __('Discount: ') }
                    { coupon_code && (
                        <strong block="CartOverlay" elem="DiscountCoupon">{ coupon_code.toUpperCase() }</strong>
                    ) }
                </dt>
                <dd>{ `-${ instance.renderPriceLine(Math.abs(discount_amount)) }` }</dd>
            </dl>
        );
    };
}

export const { aroundRenderDiscount } = new CartOverlayComponentPlugin();

export default {
    'Component/CartOverlay/Component': {
        'member-function': {
            renderDiscount: [
                {
                    position: 100,
                    implementation: aroundRenderDiscount
                }
            ]
        }
    }
};
