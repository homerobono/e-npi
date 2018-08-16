import { trigger, state, animate, transition, style } from '@angular/animations';

export const slideInOutAnimation =
    trigger('slideInOutAnimation', [
        transition(':enter', [
          style(
              {transform: 'translateY(-200%)'}
            ),
          animate(
              '200ms ease-out', 
              style({transform: 'translateY(0%)'})
            )
        ]),
        transition(':leave', [
          animate(
              '200ms ease-in-out', 
              style({transform: 'translateY(-200%)'})
            )
        ])
    ]);