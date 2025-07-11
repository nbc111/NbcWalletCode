import React, { useState, useEffect } from 'react';
import { Translate } from 'react-localize-redux';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Textfit } from 'react-textfit';
import styled from 'styled-components';

import ActivitiesWrapper from './ActivitiesWrapper';
import AllTokensTotalBalanceUSD from './AllTokensTotalBalanceUSD';
import CreateCustomNameModal from './CreateCustomNameModal';
import CreateFromImplicitSuccessModal from './CreateFromImplicitSuccessModal';
import DepositNearBanner from './DepositNearBanner';
import LinkDropSuccessModal from './LinkDropSuccessModal';
import NFTs from './NFTs';
import SidebarLight from './SidebarLight';
import Tokens from './Tokens';
import { ZeroBalanceAccountImportedModal } from './ZeroBalanceAccountImportedModal';
import getCurrentLanguage from '../../hooks/getCurrentLanguage';
import { usePerformanceMonitor } from '../../hooks/usePerformanceMonitor';
import { selectPasswordProtectionSlice } from '../../redux/slices/passwordProtectedWallet/passwordProtectedWallet';
import classNames from '../../utils/classNames';
import { SHOW_NETWORK_BANNER } from '../../utils/wallet';
import AlertBanner from '../common/AlertBanner';
import FormButton from '../common/FormButton';
import Container from '../common/styled/Container.css';
import Tooltip from '../common/Tooltip';
import DownArrowIcon from '../svg/DownArrowIcon';
import SendIcon from '../svg/SendIcon';
import TopUpIcon from '../svg/TopUpIcon';
import WrapIcon from '../svg/WrapIcon';
import { selectAllowedTokens, selectTokensLoading } from '../../redux/slices/tokens';
import useSortedTokens from '../../hooks/useSortedTokens';
import { selectAccountId } from '../../redux/slices/account';
import BannerChangeRpc from '../connection/BannerChangeRpc';

const StyledContainer = styled(Container)`
    @media (max-width: 991px) {
        margin: -5px auto 0 auto;
        &.showing-banner {
            margin-top: -15px;
        }
    }

    .split {
        margin-top: 20px;
    }

    .coingecko {
        color: #b4b4b4;
        align-self: end;
        margin: 20px;
        @media (max-width: 991px) {
            margin: -25px 0 25px 0;
        }
    }

    .sub-title {
        font-size: 14px;
        margin-bottom: 10px;

        &.balance {
            color: #a2a2a8;
            margin-top: 0;
            display: flex;
            align-items: center;
        }

        &.tokens {
            color: #72727a;
            margin-top: 20px;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            max-width: unset;

            @media (min-width: 768px) {
                padding: 0 20px;
            }

            .dots {
                :after {
                    position: absolute;
                    content: '.';
                    animation: link 1s steps(5, end) infinite;

                    @keyframes link {
                        0%,
                        20% {
                            color: rgba(0, 0, 0, 0);
                            text-shadow: 0.3em 0 0 rgba(0, 0, 0, 0),
                                0.6em 0 0 rgba(0, 0, 0, 0);
                        }
                        40% {
                            color: #24272a;
                            text-shadow: 0.3em 0 0 rgba(0, 0, 0, 0),
                                0.6em 0 0 rgba(0, 0, 0, 0);
                        }
                        60% {
                            text-shadow: 0.3em 0 0 #24272a, 0.6em 0 0 rgba(0, 0, 0, 0);
                        }
                        80%,
                        100% {
                            text-shadow: 0.3em 0 0 #24272a, 0.6em 0 0 #24272a;
                        }
                    }
                }
            }
        }
    }

    .left {
        display: flex;
        flex-direction: column;
        align-items: center;

        > svg {
            margin-top: 25px;
        }

        .total-balance {
            margin: 40px 0 10px 0;
            width: 100%;
            font-weight: 600;
            text-align: center;
            color: #24272a;
        }

        @media (min-width: 992px) {
            border: 2px solid #f0f0f0;
            border-radius: 8px;
            height: max-content;
        }

        .buttons {
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 30px 0;
            width: 100%;
            flex-wrap: wrap;
            margin: 30px -14px;
            width: calc(100% + 28px);

            @media (min-width: 992px) {
                margin-left: 0;
                margin-right: 0;
                width: 100%;
            }

            button {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                width: auto;
                height: auto;
                background-color: transparent !important;
                border: 0;
                padding: 0;
                color: #3f4045;
                font-weight: 400;
                font-size: 14px;
                margin: 20px 18px;
                border-radius: 0;

                :hover {
                    color: #3f4045;

                    > div {
                        background-color: black;
                    }
                }

                > div {
                    background-color: #272729;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 56px;
                    height: 56px;
                    min-width: 56px;
                    width: 56px;
                    border-radius: 20px;
                    margin-bottom: 10px;
                    transition: 100ms;
                }

                svg {
                    width: 22px !important;
                    height: 22px !important;
                    margin: 0 !important;

                    path {
                        stroke: white;
                    }
                }
            }
        }

        .tab-selector {
            width: 100%;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            justify-content: space-around;

            > div {
                flex: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 25px 0;
                border-bottom: 1px solid transparent;
                color: black;
                font-weight: 600;
                font-size: 16px;

                &.inactive {
                    background-color: #fafafa;
                    border-bottom: 1px solid #f0f0f1;
                    cursor: pointer;
                    color: #a2a2a8;
                    transition: color 100ms;

                    :hover {
                        color: black;
                    }
                }
            }

            .tab-balances {
                border-right: 1px solid transparent;

                @media (max-width: 767px) {
                    margin-left: -14px;
                }

                @media (min-width: 992px) {
                    border-top-left-radius: 8px;
                }

                &.inactive {
                    border-right: 1px solid #f0f0f1;
                }
            }

            .tab-collectibles {
                border-left: 1px solid transparent;

                @media (max-width: 767px) {
                    margin-right: -14px;
                }

                @media (min-width: 992px) {
                    border-top-right-radius: 8px;
                }

                &.inactive {
                    border-left: 1px solid #f0f0f1;
                }
            }
        }
    }

    button {
        &.gray-blue {
            width: 100% !important;
            margin-top: 35px !important;
        }
    }

    h2 {
        font-weight: 900;
        font-size: 22px;
        align-self: flex-start;
        margin: 50px 0 30px 0;
        text-align: left;
        color: #24272a;
    }

    .deposit-banner-wrapper {
        width: 100%;
        .deposit-near-banner {
            > div {
                border-top: 1px solid #f0f0f1;
                padding: 20px;

                @media (max-width: 991px) {
                    margin: 0 -14px;
                    padding: 20px 0;
                    border-bottom: 15px solid #f0f0f1;
                }

                @media (max-width: 767px) {
                    padding: 20px 14px 20px 14px;
                }
            }
        }
    }
`;

export function Wallet({
    tab,
    setTab,
    accountId,
    accountExists,
    balance,
    linkdropAmount,
    createFromImplicitSuccess,
    createCustomName,
    zeroBalanceAccountImportMethod,
    availableAccounts,
    handleCloseLinkdropModal,
    handleSetCreateFromImplicitSuccess,
    handleSetCreateCustomName,
    handleSetZeroBalanceAccountImportMethod,
    userRecoveryMethods,
}) {
    const { dataStatus } = useSelector(selectPasswordProtectionSlice);
    
    // 性能监控
    usePerformanceMonitor('Wallet', true);

    return (
        <div>
            <BannerChangeRpc />
            <StyledContainer className={SHOW_NETWORK_BANNER ? 'showing-banner' : ''}>
                {/* TODO: Style and translate this */}
                {!dataStatus.hasEncryptedData && (
                    <AlertBanner
                        theme={'warning'}
                        className={'password-encryption-alert'}
                    >
                        <Translate id='wallet.recommendToSetPassword' />
                        <br />
                        <Link to='/set-password' className={'right'}>
                            <Translate id='wallet.setUpPasswordBtn' />
                        </Link>
                    </AlertBanner>
                )}

                <div className='split'>
                    <div className='left'>
                        <div className='tab-selector'>
                            <div
                                className={classNames([
                                    'tab-balances',
                                    tab === 'collectibles' ? 'inactive' : '',
                                ])}
                                onClick={() => setTab('')}
                            >
                                <Translate id='wallet.balances' />
                            </div>
                            <div
                                className={classNames([
                                    'tab-collectibles',
                                    tab !== 'collectibles' ? 'inactive' : '',
                                ])}
                                onClick={() => setTab('collectibles')}
                            >
                                <Translate id='wallet.collectibles' />
                            </div>
                        </div>
                        {tab === 'collectibles' ? (
                            <NFTs accountId={accountId} />
                        ) : (
                            <FungibleTokens accountExists={accountExists} />
                        )}
                    </div>
                    <div className='right'>
                        <SidebarLight
                            availableAccounts={accountExists && availableAccounts}
                        />
                        <ActivitiesWrapper accountId={accountId} />
                    </div>
                </div>
                {linkdropAmount !== '0' && (
                    <LinkDropSuccessModal
                        onClose={handleCloseLinkdropModal}
                        linkdropAmount={linkdropAmount}
                    />
                )}
                {createFromImplicitSuccess && (
                    <CreateFromImplicitSuccessModal
                        onClose={handleSetCreateFromImplicitSuccess}
                        isOpen={createFromImplicitSuccess}
                        accountId={accountId}
                    />
                )}
                {createCustomName && (
                    <CreateCustomNameModal
                        onClose={handleSetCreateCustomName}
                        isOpen={createCustomName}
                        accountId='satoshi.near'
                    />
                )}
                {zeroBalanceAccountImportMethod && (
                    <ZeroBalanceAccountImportedModal
                        onClose={handleSetZeroBalanceAccountImportMethod}
                        importMethod={zeroBalanceAccountImportMethod}
                        accountId={accountId}
                    />
                )}
            </StyledContainer>
        </div>
    );
}

const FungibleTokens = ({ accountExists }) => {
    const allowedTokens = useSelector(selectAllowedTokens);
    const fungibleTokens = useSortedTokens(allowedTokens);
    const currentLanguage = getCurrentLanguage();
    const [shouldLoadTokens, setShouldLoadTokens] = useState(false);

    const accountId = useSelector(selectAccountId);
    const tokensLoading = useSelector((state) =>
        selectTokensLoading(state, { accountId })
    );

    // 延迟1秒加载token数据，优先显示骨架屏
    useEffect(() => {
        const timer = setTimeout(() => {
            setShouldLoadTokens(true);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    const zeroBalanceAccount = accountExists === false;
    const currentFungibleTokens = fungibleTokens[0];
    const hideFungibleTokenSection =
        zeroBalanceAccount &&
        fungibleTokens?.length === 1 &&
        currentFungibleTokens?.onChainFTMetadata?.symbol === 'NBC';

    // Token骨架屏
    const TokenSkeleton = () => (
        <div>
            <div style={{ 
                background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                backgroundSize: '200% 100%',
                animation: 'loading 1.5s infinite',
                borderRadius: '4px',
                width: '80%', 
                height: '48px', 
                margin: '40px auto 10px auto' 
            }}></div>
            <div style={{ 
                background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                backgroundSize: '200% 100%',
                animation: 'loading 1.5s infinite',
                borderRadius: '4px',
                width: '60%', 
                height: '20px', 
                margin: '0 auto 30px auto' 
            }}></div>
            <div style={{ 
                background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                backgroundSize: '200% 100%',
                animation: 'loading 1.5s infinite',
                borderRadius: '4px',
                width: '70%', 
                height: '24px', 
                margin: '0 auto 20px auto' 
            }}></div>
        </div>
    );

    return (
        <>
            {!shouldLoadTokens ? (
                <TokenSkeleton />
            ) : (
                <>
                    <div className='total-balance'>
                        <Textfit mode='single' max={48}>
                            <AllTokensTotalBalanceUSD allFungibleTokens={fungibleTokens} />
                        </Textfit>
                    </div>
                    <div className='sub-title balance'>
                        <Translate id='wallet.availableBalance' />{' '}
                        <Tooltip translate='availableBalanceInfo' />
                    </div>
                </>
            )}
            <div className='buttons'>
                <FormButton
                    color='dark-gray'
                    linkTo='/send-money'
                    trackingId='Click Send on Wallet page'
                    data-test-id='balancesTab.send'
                >
                    <div>
                        <SendIcon />
                    </div>
                    <Translate id='button.send' />
                </FormButton>
                <FormButton
                    color='dark-gray'
                    linkTo='/receive-money'
                    trackingId='Click Receive on Wallet page'
                    data-test-id='balancesTab.receive'
                >
                    <div>
                        <DownArrowIcon />
                    </div>
                    <Translate id='button.receive' />
                </FormButton>
                <FormButton
                    color='dark-gray'
                    linkTo='/buy'
                    trackingId='Click Top Up on Wallet page'
                    data-test-id='balancesTab.buy'
                >
                    <div>
                        <TopUpIcon />
                    </div>
                    <Translate id='button.topUp' />
                </FormButton>
                <FormButton
                    color='dark-gray'
                    linkTo='/swap'
                    trackingId='Click Swap on Wallet page'
                    data-test-id='balancesTab.swap'
                >
                    <div>
                        <WrapIcon color='white' />
                    </div>
                    <Translate id='button.swap' />
                </FormButton>
            </div>
            {zeroBalanceAccount && (
                <div className='deposit-banner-wrapper'>
                    <DepositNearBanner />
                </div>
            )}
            {!hideFungibleTokenSection && (
                <>
                    <div className='sub-title tokens'>
                        <span className={classNames({ dots: tokensLoading && shouldLoadTokens })}>
                            <Translate id='wallet.yourPortfolio' />
                        </span>
                    </div>
                    <Tokens
                        tokens={fungibleTokens}
                        currentLanguage={currentLanguage}
                        showFiatPrice
                        isLoading={tokensLoading && shouldLoadTokens}
                    />
                </>
            )}
        </>
    );
};
