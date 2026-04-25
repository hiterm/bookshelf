import {
  Anchor,
  AnchorProps,
  Button,
  ButtonProps,
  NavLink,
  NavLinkProps,
} from "@mantine/core";
import {
  createLink,
  Link,
  LinkComponent,
  RegisteredRouter,
  ValidateLinkOptions,
} from "@tanstack/react-router";
import * as React from "react";

// Link
type MantineAnchorProps = Omit<AnchorProps, "href">;

const MantineLinkComponent = React.forwardRef<
  HTMLAnchorElement,
  MantineAnchorProps
>(function MantineLinkComponent(props, ref) {
  return <Anchor ref={ref} {...props} />;
});

const CreatedLinkComponent = createLink(MantineLinkComponent);

const CustomLink: LinkComponent<typeof MantineLinkComponent> = (props) => {
  return <CreatedLinkComponent preload="intent" {...props} />;
};

export { CustomLink as Link };

type MantineNavLinkProps = Omit<NavLinkProps, "href">;

// NavLink
const MantineNavLinkComponent = React.forwardRef<
  HTMLAnchorElement,
  MantineNavLinkProps
>(function MantineLinkComponent(props, ref) {
  return <NavLink ref={ref} {...props} />;
});

const CreatedNavLinkComponent = createLink(MantineNavLinkComponent);

const CustomNavLink: LinkComponent<typeof MantineNavLinkComponent> = (
  props,
) => {
  return <CreatedNavLinkComponent preload="intent" {...props} />;
};

export { CustomNavLink as NavLink };

// Button
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface LinkButtonProps<
  TRouter extends RegisteredRouter = RegisteredRouter,
  TOptions = unknown,
> extends ButtonProps {
  linkOptions: ValidateLinkOptions<TRouter, TOptions>;
}

export function LinkButton<TRouter extends RegisteredRouter, TOptions>(
  props: LinkButtonProps<TRouter, TOptions>,
): React.ReactNode;
export function LinkButton(props: LinkButtonProps): React.ReactNode {
  const { linkOptions: linkOptions, ...buttonProps } = props;
  return (
    <Button
      {...buttonProps}
      renderRoot={(rootProps) => <Link {...linkOptions} {...rootProps} />}
    />
  );
}
