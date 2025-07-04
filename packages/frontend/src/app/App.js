import { ConnectedRouter, getRouter } from 'connected-react-router';
import isString from 'lodash.isstring';
import { parseSeedPhrase } from 'near-seed-phrase';
import PropTypes from 'prop-types';
import { stringify } from 'query-string';
import React, { Component, lazy } from 'react';
import ReactDOMServer from 'react-dom/server';
import { withLocalize } from 'react-localize-redux';
import { connect } from 'react-redux';
import { Redirect, Switch } from 'react-router-dom';
import styled, { ThemeProvider } from 'styled-components';
import LazyLoader from '../components/common/LazyLoader';

// 懒加载组件 - 按需加载
const AccessKeysWrapper = lazy(() => import('../components/access-keys/v2/AccessKeysWrapper'));
const AutoImportWrapper = lazy(() => import('../components/accounts/auto_import/AutoImportWrapper'));
const BatchImportAccounts = lazy(() => import('../components/accounts/batch_import_accounts'));
const BatchLedgerExport = lazy(() => import('../components/accounts/batch_ledger_export'));
const ExistingAccountWrapper = lazy(() => import('../components/accounts/create/existing_account/ExistingAccountWrapper'));
const InitialDepositWrapper = lazy(() => import('../components/accounts/create/initial_deposit/InitialDepositWrapper'));
const CreateAccountLanding = lazy(() => import('../components/accounts/create/landing/CreateAccountLanding'));
const VerifyAccountWrapper = lazy(() => import('../components/accounts/create/verify_account/VerifyAccountWrapper'));
const CreateAccountWithRouter = lazy(() => import('../components/accounts/CreateAccount'));
const LedgerConfirmActionModal = lazy(() => import('../components/accounts/ledger/LedgerConfirmActionModal'));
const LedgerConnectModal = lazy(() => import('../components/accounts/ledger/LedgerConnectModal/LedgerConnectModalWrapper'));
const SetupLedgerWithRouter = lazy(() => import('../components/accounts/ledger/SetupLedger'));
const SetupLedgerSuccessWithRouter = lazy(() => import('../components/accounts/ledger/SetupLedgerSuccess'));
const SignInLedgerWrapper = lazy(() => import('../components/accounts/ledger/SignInLedgerWrapper'));
const LinkdropLandingWithRouter = lazy(() => import('../components/accounts/LinkdropLanding'));
const ChangePasswordPage = lazy(() => import('../components/accounts/password_encryption/ChangePasswordPage').then(module => ({ default: module.ChangePasswordPage })));
const SetPasswordPage = lazy(() => import('../components/accounts/password_encryption/SetPasswordPage').then(module => ({ default: module.SetPasswordPage })));
const RecoverAccountPrivateKey = lazy(() => import('../components/accounts/RecoverAccountPrivateKey'));
const RecoverAccountSeedPhraseWithRouter = lazy(() => import('../components/accounts/RecoverAccountSeedPhrase'));
const RecoverAccountWrapper = lazy(() => import('../components/accounts/RecoverAccountWrapper'));
const SetupRecoveryMethodWithRouter = lazy(() => import('../components/accounts/recovery_setup/SetupRecoveryMethod'));
const SetupImplicitWithRouter = lazy(() => import('../components/accounts/SetupImplicit'));
const SetupSeedPhraseWithRouter = lazy(() => import('../components/accounts/SetupSeedPhrase'));
const EnableTwoFactor = lazy(() => import('../components/accounts/two_factor/EnableTwoFactor').then(module => ({ default: module.EnableTwoFactor })));
const TwoFactorVerifyModal = lazy(() => import('../components/accounts/two_factor/TwoFactorVerifyModal'));
const BuyNear = lazy(() => import('../components/buy/BuyNear').then(module => ({ default: module.BuyNear })));
import Bootstrap from '../components/common/Bootstrap';
import Footer from '../components/common/Footer';
import GlobalAlert from '../components/common/GlobalAlert';
import GuestLandingRoute from '../components/common/GuestLandingRoute';
import LazyLoader from '../components/common/LazyLoader';
import NetworkBanner from '../components/common/NetworkBanner';
import PasswordProtectedRoute from '../components/common/routing/PasswordProtectedRoute';
import PrivateRoute from '../components/common/routing/PrivateRoute';
import PublicRoute from '../components/common/routing/PublicRoute';
import Route from '../components/common/routing/Route';
import Updater from '../components/common/Updater';
import GlobalStyle from '../components/GlobalStyle';
import NavigationWrapper from '../components/navigation/NavigationWrapper';
import PageNotFound from '../components/page-not-found/PageNotFound';
import './index.css';
import CONFIG from '../config';
import { Mixpanel } from '../mixpanel/index';
import * as accountActions from '../redux/actions/account';
import { handleClearAlert } from '../redux/reducers/status';
import { selectAccountSlice } from '../redux/slices/account';
import { actions as flowLimitationActions } from '../redux/slices/flowLimitation';
import { actions as tokenFiatValueActions } from '../redux/slices/tokenFiatValues';
import WalletWrapper from '../routes/WalletWrapper';
import translations_en from '../translations/locales/en/translation.json';
import translations_zh_hans from '../translations/locales/zh-hans/translation.json';
import classNames from '../utils/classNames';
import getBrowserLocale from '../utils/getBrowserLocale';
import { reportUiActiveMixpanelThrottled } from '../utils/reportUiActiveMixpanelThrottled';
import ScrollToTop from '../utils/ScrollToTop';
import {
    WALLET_CREATE_NEW_ACCOUNT_FLOW_URLS,
    WALLET_LOGIN_URL,
    WALLET_SEND_MONEY_URL,
    WALLET_SIGN_URL,
} from '../utils/wallet';

// 懒加载组件
const Connection = lazy(() => import('../components/connection/Connection'));
const ExploreContainer = lazy(() => import('../components/explore/ExploreContainer').then(module => ({ default: module.ExploreContainer })));
const LoginCliLoginSuccess = lazy(() => import('../components/login/LoginCliLoginSuccess'));
const NFTDetailWrapper = lazy(() => import('../components/nft/NFTDetailWrapper'));
const Privacy = lazy(() => import('../components/privacy/Privacy'));
const Profile = lazy(() => import('../components/profile/Profile'));
const ReceiveContainerWrapper = lazy(() => import('../components/receive-money/ReceiveContainerWrapper'));
const SendContainerWrapper = lazy(() => import('../components/send/SendContainerWrapper'));
const StakingContainer = lazy(() => import('../components/staking/StakingContainer'));
const Terms = lazy(() => import('../components/terms/Terms'));
const WalletMigration = lazy(() => import('../components/wallet-migration/WalletMigration'));
const TokenSwap = lazy(() => import('../pages/TokenSwap'));
const TransactionHistory = lazy(() => import('../pages/TransactionHistory'));
const CreateImplicitAccountWrapper = lazy(() => import('../routes/CreateImplicitAccountWrapper'));
const ImportAccountWithLinkWrapper = lazy(() => import('../routes/ImportAccountWithLinkWrapper'));
const LoginWrapper = lazy(() => import('../routes/LoginWrapper'));
const SetupLedgerNewAccountWrapper = lazy(() => import('../routes/SetupLedgerNewAccountWrapper'));
const SetupPassphraseNewAccountWrapper = lazy(() => import('../routes/SetupPassphraseNewAccountWrapper'));
const SetupRecoveryImplicitAccountWrapper = lazy(() => import('../routes/SetupRecoveryImplicitAccountWrapper'));
const SignMessageWrapper = lazy(() => import('../routes/SignMessageWrapper'));
const SignWrapper = lazy(() => import('../routes/SignWrapper'));
const VerifyOwnerWrapper = lazy(() => import('../routes/VerifyOwnerWrapper'));
const TransactionExecutorModal = lazy(() => import('../components/transactions/ExecutorModal/TransactionExecutorModal'));
const LiquidStakingContainer = lazy(() => import('../components/staking/liquid-staking/LiquidStakingContainer'));

const { getTokenWhiteList } = tokenFiatValueActions;

const {
    handleClearUrl,
    handleRedirectUrl,
    handleRefreshUrl,
    promptTwoFactor,
    redirectTo,
    refreshAccount,
} = accountActions;

const { handleFlowLimitation } = flowLimitationActions;

const theme = {};

const PATH_PREFIX = CONFIG.PUBLIC_URL;

// TODO: https://mnw.atlassian.net/browse/MNW-98
const WEB3AUTH_FEATURE_ENABLED = true;

const Container = styled.div`
    min-height: 100vh;
    padding-bottom: 260px;
    padding-top: 75px;

    @media (max-width: 991px) {
        .App {
            .main {
                padding-bottom: 0px;
            }
        }
    }

    &.network-banner {
        @media (max-width: 450px) {
            .alert-banner,
            .lockup-avail-transfer {
                margin-top: -45px;
            }
        }
    }

    @media (max-width: 767px) {
        &.hide-footer-mobile {
            .wallet-footer {
                display: none;
            }
        }
    }
`;

class Routing extends Component {
    constructor(props) {
        super(props);

        this.pollTokenFiatValue = null;

        const languages = [
            { name: 'English', code: 'en' },
            // { name: 'Italiano', code: 'it' },
            // { name: 'Português', code: 'pt' },
            // { name: 'Русский', code: 'ru' },
            // { name: 'Tiếng Việt', code: 'vi' },
            { name: '简体中文', code: 'zh-hans' },
            // { name: '繁體中文', code: 'zh-hant' },
            // { name: 'Türkçe', code: 'tr' },
            // { name: 'Українська', code: 'ua' },
        ];

        const browserLanguage = getBrowserLocale(languages.map((l) => l.code));

        console.log('Browser Language', browserLanguage);

        let storedLanguage = localStorage.getItem('languageCode'); // "undefined"
        if (storedLanguage === 'undefined') {
            storedLanguage = undefined;
        }

        const activeLang = storedLanguage ?? browserLanguage ?? languages[0].code;

        this.props.initialize({
            languages,
            options: {
                defaultLanguage: 'en',
                onMissingTranslation: ({ translationId, defaultTranslation }) => {
                    if (isString(defaultTranslation)) {
                        // do anything to change the defaultTranslation as you wish
                        return defaultTranslation;
                    } else {
                        // that's the code that can fix the issue
                        return ReactDOMServer.renderToStaticMarkup(defaultTranslation);
                    }
                },
                renderToStaticMarkup: ReactDOMServer.renderToStaticMarkup,
                renderInnerHtml: true,
            },
        });

        // 只加载实际使用的语言翻译文件，提升加载速度
        this.props.addTranslationForLanguage(translations_en, 'en');
        this.props.addTranslationForLanguage(translations_zh_hans, 'zh-hans');

        this.props.setActiveLanguage(activeLang);
        // this.addTranslationsForActiveLanguage(defaultLanguage)

        this.state = {
            openTransferPopup: false,
        };
    }

    componentDidMount = async () => {
        const {
            refreshAccount,
            handleRefreshUrl,
            history,
            handleRedirectUrl,
            handleClearUrl,
            router,
            handleClearAlert,
            handleFlowLimitation,
        } = this.props;

        handleRefreshUrl(router);
        refreshAccount();

        history.listen(async () => {
            handleRedirectUrl(this.props.router.location);
            handleClearUrl();
            if (
                !WALLET_CREATE_NEW_ACCOUNT_FLOW_URLS.find(
                    (path) => this.props.router.location.pathname.indexOf(path) > -1
                )
            ) {
                await refreshAccount(true);
            }

            handleClearAlert();
            handleFlowLimitation();
        });
    };

    componentDidUpdate(prevProps) {
        const { activeLanguage, account } = this.props;

        if (
            prevProps.account.accountId !== account.accountId &&
            account.accountId !== undefined
        ) {
            this.props.getTokenWhiteList(account.accountId);
        }

        const prevLangCode = prevProps.activeLanguage && prevProps.activeLanguage.code;
        const curLangCode = activeLanguage && activeLanguage.code;
        const hasLanguageChanged = prevLangCode !== curLangCode;

        if (hasLanguageChanged) {
            // this.addTranslationsForActiveLanguage(curLangCode)
            localStorage.setItem('languageCode', curLangCode);
        }
    }

    handleTransferClick = () => {
        this.setState({ openTransferPopup: true });
    };

    closeTransferPopup = () => {
        this.setState({ openTransferPopup: false });
    };

    render() {
        const {
            search,
            query: { tab },
            hash,
            pathname,
        } = this.props.router.location;
        const { account } = this.props;
        const setTab = (nextTab) => {
            if (tab !== nextTab) {
                // Ensure any `hash` value remains in the URL when we toggle tab
                this.props.history.push({
                    search: stringify(
                        { tab: nextTab },
                        { skipNull: true, skipEmptyString: true }
                    ),
                    hash,
                });
            }
        };

        const hideFooterOnMobile = [
            WALLET_LOGIN_URL,
            WALLET_SEND_MONEY_URL,
            WALLET_SIGN_URL,
        ].includes(pathname.replace(/\//g, ''));

        const accountFound = this.props.account.localStorage?.accountFound;

        reportUiActiveMixpanelThrottled();

        return (
            <Container
                className={classNames([
                    'App',
                    {
                        'network-banner':
                            !CONFIG.IS_MAINNET || CONFIG.SHOW_PRERELEASE_WARNING,
                    },
                    { 'hide-footer-mobile': hideFooterOnMobile },
                ])}
                id='app-container'
            >
                {/*<TempEvent />*/}
                <Bootstrap />
                <Updater />
                <GlobalStyle />
                <ConnectedRouter basename={PATH_PREFIX} history={this.props.history}>
                    <ThemeProvider theme={theme}>
                        <ScrollToTop />
                        <NetworkBanner account={account} />
                        <NavigationWrapper />
                        <GlobalAlert />
                        <LazyLoader>
                            <WalletMigration
                                open={this.state.openTransferPopup}
                                history={this.props.history}
                                onClose={this.closeTransferPopup}
                            />
                            <LedgerConfirmActionModal />
                            <LedgerConnectModal />
                            <TransactionExecutorModal />
                            {account.requestPending !== null && (
                                <TwoFactorVerifyModal
                                    onClose={(verified, error) => {
                                        const { account, promptTwoFactor } = this.props;
                                        Mixpanel.track('2FA Modal Verify start');
                                        account.requestPending(verified, error);
                                        promptTwoFactor(null);
                                        if (error) {
                                            Mixpanel.track('2FA Modal Verify fail', {
                                                error: error.message,
                                            });
                                        }
                                        if (verified) {
                                            Mixpanel.track('2FA Modal Verify finish');
                                        }
                                    }}
                                />
                            )}
                            <Switch>
                                <Redirect
                                    from='//*'
                                    to={{
                                        pathname: '/*',
                                        search: search,
                                    }}
                                />
                                <GuestLandingRoute
                                    exact
                                    path='/'
                                    render={(props) => (
                                        <WalletWrapper tab={tab} setTab={setTab} {...props} />
                                    )}
                                    accountFound={accountFound}
                                    indexBySearchEngines={!accountFound}
                                />
                                <Route
                                    exact
                                    path={'/set-password'}
                                    render={() => (
                                        <SetPasswordPage
                                            uponSetPassword={() => {
                                                // this.props.history.push('/');
                                            }}
                                        />
                                    )}
                                />
                                <PasswordProtectedRoute
                                    exact
                                    path='/change-password'
                                    component={ChangePasswordPage}
                                />
                                <Route
                                    exact
                                    path='/linkdrop/:fundingContract/:fundingKey'
                                    component={LinkdropLandingWithRouter}
                                />
                                <PasswordProtectedRoute
                                    exact
                                    path='/create/:fundingContract/:fundingKey'
                                    component={CreateAccountWithRouter}
                                />
                                <PasswordProtectedRoute
                                    exact
                                    path='/create'
                                    render={(props) =>
                                        accountFound || !CONFIG.DISABLE_CREATE_ACCOUNT ? (
                                            <CreateAccountWithRouter {...props} />
                                        ) : (
                                            <CreateAccountLanding />
                                        )
                                    }
                                />
                                <PasswordProtectedRoute
                                    exact
                                    path='/create'
                                    component={CreateAccountWithRouter}
                                />
                                <PasswordProtectedRoute
                                    exact
                                    path={'/create-from/:fundingAccountId'}
                                    component={CreateAccountWithRouter}
                                />
                                <PasswordProtectedRoute
                                    exact
                                    path='/set-recovery/:accountId/:fundingContract?/:fundingKey?'
                                    component={SetupRecoveryMethodWithRouter}
                                />
                                <PublicRoute
                                    exact
                                    path='/set-recovery-implicit-account'
                                    component={SetupRecoveryImplicitAccountWrapper}
                                />
                                <PublicRoute
                                    exact
                                    path='/setup-passphrase-new-account'
                                    component={SetupPassphraseNewAccountWrapper}
                                />
                                <PublicRoute
                                    exact
                                    path='/setup-ledger-new-account'
                                    component={SetupLedgerNewAccountWrapper}
                                />
                                <PublicRoute
                                    exact
                                    path='/create-implicit-account'
                                    component={CreateImplicitAccountWrapper}
                                />
                                <PasswordProtectedRoute
                                    exact
                                    path='/setup-seed-phrase/:accountId/:step'
                                    component={SetupSeedPhraseWithRouter}
                                />
                                <PasswordProtectedRoute
                                    exact
                                    path='/verify-account'
                                    component={VerifyAccountWrapper}
                                />
                                <PasswordProtectedRoute
                                    exact
                                    path='/initial-deposit'
                                    component={InitialDepositWrapper}
                                />
                                <PasswordProtectedRoute
                                    exact
                                    path='/fund-with-existing-account'
                                    component={ExistingAccountWrapper}
                                />
                                <PasswordProtectedRoute
                                    exact
                                    path='/fund-create-account/:accountId/:implicitAccountId/:recoveryMethod'
                                    component={SetupImplicitWithRouter}
                                />
                                <PasswordProtectedRoute
                                    exact
                                    path='/setup-ledger/:accountId'
                                    component={SetupLedgerWithRouter}
                                />
                                <PrivateRoute
                                    exact
                                    path='/setup-ledger-success'
                                    component={SetupLedgerSuccessWithRouter}
                                />
                                <PrivateRoute
                                    exact
                                    path='/enable-two-factor'
                                    component={EnableTwoFactor}
                                />
                                <PasswordProtectedRoute
                                    path='/recover-account'
                                    component={RecoverAccountWrapper}
                                    indexBySearchEngines={true}
                                />
                                <PasswordProtectedRoute
                                    exact
                                    path='/recover-seed-phrase/:accountId?/:seedPhrase?'
                                    component={RecoverAccountSeedPhraseWithRouter}
                                />
                                <PasswordProtectedRoute
                                    exact
                                    path='/recover-with-link/:accountId/:seedPhrase'
                                    component={ImportAccountWithLinkWrapper}
                                />
                                <PasswordProtectedRoute
                                    exact
                                    path='/recover-private-key'
                                    component={RecoverAccountPrivateKey}
                                />
                                <PasswordProtectedRoute
                                    exact
                                    path='/auto-import-seed-phrase'
                                    render={({ location }) => {
                                        const importString = decodeURIComponent(
                                            location.hash.substring(1)
                                        );
                                        const hasAccountId = importString.includes('/');
                                        const seedPhrase = hasAccountId
                                            ? importString.split('/')[1]
                                            : importString;
                                        const { secretKey } = parseSeedPhrase(seedPhrase);
                                        return (
                                            <AutoImportWrapper
                                                secretKey={secretKey}
                                                accountId={
                                                    hasAccountId
                                                        ? importString.split('/')[0]
                                                        : null
                                                }
                                                mixpanelImportType='seed phrase'
                                            />
                                        );
                                    }}
                                />
                                <PasswordProtectedRoute
                                    exact
                                    path='/auto-import-secret-key'
                                    render={({ location }) => {
                                        const importString = decodeURIComponent(
                                            location.hash.substring(1)
                                        );
                                        const hasAccountId = importString.includes('/');
                                        return (
                                            <AutoImportWrapper
                                                secretKey={
                                                    hasAccountId
                                                        ? importString.split('/')[1]
                                                        : importString
                                                }
                                                accountId={
                                                    hasAccountId
                                                        ? importString.split('/')[0]
                                                        : null
                                                }
                                                mixpanelImportType='secret key'
                                            />
                                        );
                                    }}
                                />
                                <PasswordProtectedRoute
                                    exact
                                    path='/batch-import'
                                    render={() => (
                                        <BatchImportAccounts
                                            onCancel={() => this.props.history.replace('/')}
                                        />
                                    )}
                                />
                                <PasswordProtectedRoute
                                    exact
                                    path='/batch-ledger-export'
                                    component={BatchLedgerExport}
                                />
                                <PasswordProtectedRoute
                                    exact
                                    path='/sign-in-ledger'
                                    component={SignInLedgerWrapper}
                                />
                                <PrivateRoute path='/login' component={LoginWrapper} />
                                <PrivateRoute
                                    exact
                                    path='/authorized-apps'
                                    render={() => (
                                        <AccessKeysWrapper type='authorized-apps' />
                                    )}
                                />
                                <PrivateRoute
                                    exact
                                    path='/full-access-keys'
                                    render={() => (
                                        <AccessKeysWrapper type='full-access-keys' />
                                    )}
                                />
                                <PrivateRoute
                                    exact
                                    path='/send-money/:accountId?'
                                    component={SendContainerWrapper}
                                />
                                <PrivateRoute
                                    exact
                                    path='/nft-detail/:contractId/:tokenId'
                                    component={NFTDetailWrapper}
                                />
                                <PrivateRoute
                                    exact
                                    path='/receive-money'
                                    component={ReceiveContainerWrapper}
                                />
                                <PrivateRoute exact path='/buy' component={BuyNear} />
                                <PrivateRoute exact path='/swap' component={TokenSwap} />
                                <PasswordProtectedRoute
                                    exact
                                    path='/profile/:accountId'
                                    component={Profile}
                                />
                                <PasswordProtectedRoute
                                    exact
                                    path='/profile/:accountId?'
                                    component={Profile}
                                />
                                <PrivateRoute exact path='/sign' component={SignWrapper} />
                                <PrivateRoute
                                    path='/staking'
                                    render={() => (
                                        <StakingContainer history={this.props.history} />
                                    )}
                                />
                                <PrivateRoute
                                    path='/liquid-staking'
                                    render={() => <LiquidStakingContainer />}
                                />
                                <PrivateRoute
                                    exact
                                    path='/transaction-history'
                                    component={TransactionHistory}
                                />
                                <PrivateRoute
                                    exact
                                    path='/explore'
                                    component={ExploreContainer}
                                />
                                <Route exact path='/connection' component={Connection} />
                                <Route
                                    exact
                                    path='/cli-login-success'
                                    component={LoginCliLoginSuccess}
                                />
                                <Route
                                    exact
                                    path='/terms'
                                    component={Terms}
                                    indexBySearchEngines={true}
                                />
                                <Route
                                    exact
                                    path='/privacy'
                                    component={Privacy}
                                    indexBySearchEngines={true}
                                />
                                <PrivateRoute
                                    exact
                                    path='/sign-message'
                                    component={SignMessageWrapper}
                                />
                                {WEB3AUTH_FEATURE_ENABLED && (
                                    <PrivateRoute
                                        exact
                                        path='/verify-owner'
                                        component={VerifyOwnerWrapper}
                                    />
                                )}
                                <PrivateRoute component={PageNotFound} />
                            </Switch>
                        </LazyLoader>
                        <Footer />
                    </ThemeProvider>
                </ConnectedRouter>
            </Container>
        );
    }
}

Routing.propTypes = {
    history: PropTypes.object.isRequired,
};

const mapDispatchToProps = {
    refreshAccount,
    handleRefreshUrl,
    handleRedirectUrl,
    handleClearUrl,
    promptTwoFactor,
    redirectTo,
    handleClearAlert,
    handleFlowLimitation,
    getTokenWhiteList,
};

const mapStateToProps = (state) => ({
    account: selectAccountSlice(state),
    router: getRouter(state),
});

export default connect(mapStateToProps, mapDispatchToProps)(withLocalize(Routing));
