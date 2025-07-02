import React, { useEffect, useState } from 'react';
import { Translate } from 'react-localize-redux';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';

import { selectAccountId } from '../../redux/slices/account';
import {
    transactionHistoryActions,
    transactionHistorySelector,
} from '../../redux/slices/transactionHistory';
import classNames from '../../utils/classNames';
import FormButton from '../common/FormButton';
import GroupedTransactions from '../transactions/GroupedTransactions';
import TransactionItemModal from '../transactions/TransactionItemModal.js';

const StyledContainer = styled.div`
    width: 100%;

    .no-activity {
        color: #b4b4b4;
        line-height: 150%;
    }

    @media (min-width: 992px) {
        border: 2px solid #f0f0f0;
        border-radius: 8px;
        padding: 20px;

        h2 {
            margin-bottom: 15px !important;
        }

        .activity-box {
            margin: 0 -20px;
            padding: 15px 20px;
            transition: 100ms;

            :hover {
                background-color: #f9f9f9;
            }

            :first-of-type {
                border-top: 1px solid #f0f0f1;
            }
        }

        && .subtitle {
            max-width: 170px;
        }
    }

    .activity-box {
        border-bottom: 1px solid #f0f0f1;

        :last-of-type {
            border-bottom: 0;
        }
    }

    h2 {
        margin-top: 0 !important;
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
                    text-shadow: 0.3em 0 0 rgba(0, 0, 0, 0), 0.6em 0 0 rgba(0, 0, 0, 0);
                }
                40% {
                    color: #24272a;
                    text-shadow: 0.3em 0 0 rgba(0, 0, 0, 0), 0.6em 0 0 rgba(0, 0, 0, 0);
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

    .skeleton {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
        border-radius: 4px;
        height: 20px;
        margin: 8px 0;
    }

    @keyframes loading {
        0% {
            background-position: 200% 0;
        }
        100% {
            background-position: -200% 0;
        }
    }
`;

const ActivitiesWrapper = ({ accountId }) => {
    const dispatch = useDispatch();
    const [shouldLoadTransactions, setShouldLoadTransactions] = useState(false);

    // 如果没有传入 accountId，则从 Redux 获取
    const accountIdFromRedux = useSelector(selectAccountId);
    const finalAccountId = accountId || accountIdFromRedux;
    const { transactions, isLoading } = useSelector(transactionHistorySelector);

    useEffect(() => {
        if (finalAccountId) {
            // 延迟1.5秒加载交易历史，优先渲染主内容
            const timer = setTimeout(() => {
                setShouldLoadTransactions(true);
                dispatch(transactionHistoryActions.fetchTransactions({ accountId: finalAccountId, page: 1 }));
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [finalAccountId]);

    const displayedTransactions = [...transactions].slice(0, 5); // 减少首屏显示的交易数量

    // 骨架屏组件
    const TransactionSkeleton = () => (
        <div>
            <div style={{ 
                background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                backgroundSize: '200% 100%',
                animation: 'loading 1.5s infinite',
                borderRadius: '4px',
                width: '60%', 
                height: '24px', 
                marginBottom: '15px' 
            }}></div>
            {[1, 2, 3].map(i => (
                <div key={i} style={{ 
                    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                    backgroundSize: '200% 100%',
                    animation: 'loading 1.5s infinite',
                    borderRadius: '4px',
                    width: '100%', 
                    height: '60px', 
                    marginBottom: '8px' 
                }}></div>
            ))}
        </div>
    );

    // 添加调试信息
    console.log('ActivitiesWrapper - shouldLoadTransactions:', shouldLoadTransactions);
    console.log('ActivitiesWrapper - finalAccountId:', finalAccountId);
    console.log('ActivitiesWrapper - accountId prop:', accountId);
    
    return (
        <StyledContainer>
            <h2 className={classNames({ dots: isLoading && shouldLoadTransactions })}>
                <Translate id='dashboard.activity' />
            </h2>
            
            {!shouldLoadTransactions ? (
                <div>
                    <div style={{ color: 'red', fontSize: '12px', marginBottom: '10px' }}>
                        🔄 显示交易历史骨架屏 (5秒后加载真实数据)
                    </div>
                    <TransactionSkeleton />
                </div>
            ) : (
                <>
                    <GroupedTransactions transactions={displayedTransactions} />
                    {transactions?.length === 0 && !isLoading && (
                        <div className='no-activity'>
                            <Translate id='dashboard.noActivity' />
                        </div>
                    )}
                </>
            )}
            
            <TransactionItemModal />
            <FormButton
                color='gray-blue'
                linkTo='transaction-history'
                trackingId='Click to account on explorer'
            >
                <Translate id='button.viewAll' />
            </FormButton>
        </StyledContainer>
    );
};

export default ActivitiesWrapper;
