<?php
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

declare(strict_types=1);

namespace ScandiPWA\AmastySpecialPromoGraphQl\Model\Resolver;

use Amasty\Rules\Model\ConfigModel as ConfigModel;
use Amasty\Rules\Model\DiscountRegistry as DiscountRegistry;
use Magento\Framework\GraphQl\Config\Element\Field;
use Magento\Framework\GraphQl\Query\ResolverInterface;
use Magento\Framework\GraphQl\Schema\Type\ResolveInfo;
use Magento\Framework\Session\SessionManager as CheckoutSession;
use Magento\Quote\Api\CartRepositoryInterface;
use Magento\Quote\Api\Data\CartInterface;
use Magento\Quote\Model\QuoteIdMaskFactory;
use Magento\Quote\Model\ResourceModel\Quote\QuoteIdMask;
use Magento\Quote\Model\Webapi\ParamOverriderCartId;

class GetDiscountBreakdownsResolver implements ResolverInterface
{
    /**
     * @var DiscountRegistry
     */
    protected $discountRegistry;

    /**
     * @var CheckoutSession
     */
    protected $checkoutSession;

    /**
     * @var ConfigModel
     */
    protected $configModel;

    /**
     * @var CartRepositoryInterface
     */
    protected $quoteRepository;

    /**
     * @var ParamOverriderCartId
     */
    protected $overriderCartId;

    /**
     * @var QuoteIdMaskFactory
     */
    protected $quoteIdMaskFactory;

    /**
     * @var QuoteIdMask
     */
    protected $quoteIdMaskResource;

    /**
     * GetDiscountBreakdowns constructor.
     * @param DiscountRegistry $discountRegistry
     * @param CheckoutSession $checkoutSession
     * @param ConfigModel $configModel
     * @param CartRepositoryInterface $quoteRepository
     * @param ParamOverriderCartId $overriderCartId
     * @param QuoteIdMaskFactory $quoteIdMaskFactory
     * @param QuoteIdMask $quoteIdMaskResource
     */
    public function __construct(
        DiscountRegistry $discountRegistry,
        CheckoutSession $checkoutSession,
        ConfigModel $configModel,
        CartRepositoryInterface $quoteRepository,
        ParamOverriderCartId $overriderCartId,
        QuoteIdMaskFactory $quoteIdMaskFactory,
        QuoteIdMask $quoteIdMaskResource
    )
    {
        $this->discountRegistry = $discountRegistry;
        $this->checkoutSession = $checkoutSession;
        $this->configModel = $configModel;
        $this->quoteRepository = $quoteRepository;
        $this->overriderCartId = $overriderCartId;
        $this->quoteIdMaskFactory = $quoteIdMaskFactory;
        $this->quoteIdMaskResource = $quoteIdMaskResource;
    }

    /**
     * Get amasty discount breakdowns
     *
     * {@inheritdoc}
     */
    public function resolve(
        Field $field,
        $context,
        ResolveInfo $info,
        array $value = null,
        array $args = null
    )
    {
        if (!$this->configModel->getShowDiscountBreakdown()) {
            return [
                'discounts' => [],
                'discount_breakdowns_enabled' => false
            ];
        }

        $quote = $this->getQuote($args);
        $this->discountRegistry->updateQuoteData($quote);
        $rulesWithDiscount = $this->discountRegistry->getRulesWithAmount();

        return [
            'discount_breakdowns_enabled' => true,
            'discounts' => $this->discountRegistry->convertRulesWithDiscountToArray($rulesWithDiscount)
        ];
    }

    /**
     * Get quote
     * @param $args
     * @return CartInterface
     * @throws \Magento\Framework\Exception\NoSuchEntityException
     */
    protected function getQuote($args) {
        $quoteId = isset($args['guestCartId']) ? $this->getGuestQuoteId($args['guestCartId']) : $this->overriderCartId->getOverriddenValue();

        return $this->quoteRepository->getActive($quoteId);
    }

    /**
     * @param string $guestCardId
     * @return string
     */
    protected function getGuestQuoteId(string $guestCardId): string
    {
        $quoteIdMask = $this->quoteIdMaskFactory->create();
        $this->quoteIdMaskResource->load($quoteIdMask, $guestCardId, 'masked_id');

        return $quoteIdMask->getQuoteId();
    }
}
