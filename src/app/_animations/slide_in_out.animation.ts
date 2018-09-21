import { trigger, state, animate, transition, style } from '@angular/animations';

export const slideInOutTopAnimation =
    trigger('slideInOutTopAnimation', [
        transition(':enter', [
            style(
                { transform: 'translateY(-200%)' }
            ),
            animate(
                '200ms ease-out',
                style({ 
                    transform: 'translateY(0%)',
                 })
            )
        ]),
        transition(':leave', [
            animate(
                '200ms ease-in-out',
                style({ transform: 'translateY(-200%)' })
            )
        ])
    ]);

export const slideInOutBottomAnimation =
    trigger('slideInOutBottomAnimation', [
        transition(':enter', [
            style(
                { transform: 'translateY(200%)' }
            ),
            animate(
                '200ms ease-out',
                style({ transform: 'translateY(0%)' })
            )
        ]),
        transition(':leave', [
            animate(
                '200ms ease-in-out',
                style({ transform: 'translateY(200%)' })
            )
        ])
    ]);

export const scaleUpDownAnimation =
    trigger('scaleUpDownAnimation', [
        transition(':enter', [
            style(
                {
                    height: '0px',
                    paddingBottom: '0px',
                    overflow: 'hidden'
                }
            ),
            animate(
                '200ms ease-out',
                style({ height: 'auto' })
            )
        ]),
        transition(':leave', [
            style(
                {
                    height: '!',
                    opacity: 1
                }
            ),
            animate(
                '500ms ease-in-out',
                style({ height: '0px' })
            )
        ])
    ]);
