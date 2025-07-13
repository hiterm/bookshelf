import * as React from 'react'
import { createLink, Link, LinkComponent, RegisteredRouter, ValidateLinkOptions } from '@tanstack/react-router'
import { Anchor, AnchorProps, Button, ButtonProps } from '@mantine/core'

type MantineAnchorProps = Omit<AnchorProps, 'href'>;

const MantineLinkComponent = React.forwardRef<
  HTMLAnchorElement,
  MantineAnchorProps
>(function MantineLinkComponent(props, ref) {
  return <Anchor ref={ref} {...props} />
})

const CreatedLinkComponent = createLink(MantineLinkComponent)

const CustomLink: LinkComponent<typeof MantineLinkComponent> = (
  props,
) => {
  return <CreatedLinkComponent preload="intent" {...props} />
}

export {CustomLink as Link};

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface LinkButtonProps<
  TRouter extends RegisteredRouter = RegisteredRouter,
  TOptions = unknown,
> extends ButtonProps {
  linkOptions: ValidateLinkOptions<TRouter, TOptions>
};

export function LinkButton<TRouter extends RegisteredRouter, TOptions>(
  props: LinkButtonProps<TRouter, TOptions>,
): React.ReactNode
export function LinkButton(props: LinkButtonProps): React.ReactNode {
  console.log(`ButtonLinkProps: ${JSON.stringify(props)}`)
  return (
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    <Button {...props} renderRoot={(props) => <Link {...props.linkOptions} {...props} />} />
  )
}
