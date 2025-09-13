// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import clsx from 'clsx';

import { AppLayoutNotificationsImplementationProps } from '../notifications';
import { AppLayoutToolbarImplementationProps } from '../toolbar';
import { SkeletonPartProps } from './interfaces';
import { BreadcrumbsSlot, NotificationsSlot, ToolbarSlot } from './slots';

import testutilStyles from '../../test-classes/styles.css.js';
import toolbarStyles from '../toolbar/styles.css.js';
import styles from './styles.css.js';

/**
 * New widgetized parts
 */

export const BeforeMainSlotSkeleton = React.forwardRef<HTMLElement, SkeletonPartProps>(
  ({ toolbarProps, appLayoutProps }, ref) => {
    return (
      <>
        {!!toolbarProps && (
          <ToolbarSlot ref={ref}>
            <div className={toolbarStyles['toolbar-container']}>
              <div className={clsx(toolbarStyles['universal-toolbar-breadcrumbs'], testutilStyles.breadcrumbs)}>
                <BreadcrumbsSlot ownBreadcrumbs={appLayoutProps.breadcrumbs} />
              </div>
              <div className={toolbarStyles['universal-toolbar-drawers']} />
            </div>
          </ToolbarSlot>
        )}
        {toolbarProps?.navigationOpen && <div className={styles.navigation} />}
      </>
    );
  }
);

/**
 * Legacy parts
 */

export const ToolbarSkeleton = React.forwardRef<HTMLElement, AppLayoutToolbarImplementationProps>(
  ({ appLayoutInternals }: AppLayoutToolbarImplementationProps, ref) => (
    <ToolbarSlot ref={ref}>
      <div className={toolbarStyles['toolbar-container']}>
        <div className={clsx(toolbarStyles['universal-toolbar-breadcrumbs'], testutilStyles.breadcrumbs)}>
          <BreadcrumbsSlot
            ownBreadcrumbs={appLayoutInternals.breadcrumbs}
            discoveredBreadcrumbs={appLayoutInternals.discoveredBreadcrumbs}
          />
        </div>
        <div className={toolbarStyles['universal-toolbar-drawers']} />
      </div>
    </ToolbarSlot>
  )
);

export const NotificationsSkeleton = React.forwardRef<HTMLElement, AppLayoutNotificationsImplementationProps>(
  (_props: AppLayoutNotificationsImplementationProps, ref) => <NotificationsSlot ref={ref} />
);
