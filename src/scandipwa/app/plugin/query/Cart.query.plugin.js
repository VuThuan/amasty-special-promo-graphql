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

import { isSignedIn } from 'Util/Auth';
import { Field } from 'Util/Query';

export class CartQueryPlugin {
    quoteId;

    /**
     * Get order request fields
     * @returns [Field]
     * @private
     */
    aroundGetCartQuery = (args, callback, instance) => {
        const [quoteId] = args;

        this.quoteId = quoteId;

        return callback.apply(instance, args);
    };

    /**
     * Get order request fields
     * @returns [Field]
     * @private
     */
    _aroundGetCartTotalsFields = (args, callback, instance) => {
        const { quoteId } = this;

        return [
            ...callback.apply(instance, args),
            this._getDiscountBreakdownMutation(quoteId)
        ];
    };

    /**
     * Get discount breakdown mutation
     * @param quoteId
     * @returns {*}
     * @private
     */
    _getDiscountBreakdownMutation(quoteId) {
        const mutation = new Field('discount_breakdowns')
            .addFieldList([
                this._getDiscountBreakdownEnabledField(),
                this._getDiscountBreakdownDiscountsFields()
            ]);

        if (!isSignedIn()) {
            mutation.addArgument('guestCartId', 'String', quoteId);
        }

        return mutation;
    }

    /**
     * Get discount breakdown discounts fields
     * @returns {*}
     * @private
     */
    _getDiscountBreakdownDiscountsFields() {
        return new Field('discounts')
            .addFieldList([
                'rule_amount',
                'rule_name'
            ]);
    }

    /**
     * Get discount breakdown enabled field
     * @returns {*}
     * @private
     */
    _getDiscountBreakdownEnabledField() {
        return new Field('discount_breakdowns_enabled');
    }
}

export const { aroundGetCartQuery, _aroundGetCartTotalsFields } = new CartQueryPlugin();

export default {
    'Query/Cart': {
        'member-function': {
            getCartQuery: [
                {
                    position: 100,
                    implementation: aroundGetCartQuery
                }
            ],
            _getCartTotalsFields: [
                {
                    position: 100,
                    implementation: _aroundGetCartTotalsFields
                }
            ]
        }
    }
};
