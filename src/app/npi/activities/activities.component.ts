import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { UtilService } from '../../services/util.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-activities',
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.scss']
})
export class ActivitiesComponent implements OnInit {
  @Output() activitiesForm = new EventEmitter<FormGroup>()
  @Input() npi

  activitiesFormGroup: FormGroup
  signatures: Array<any>

  constructor(
    private fb: FormBuilder,
    private utils: UtilService,
    private route: ActivatedRoute
  ) {
    this.activitiesFormGroup = fb.group({
      'activities': fb.array([])
    })
    this.signatures = new Array<String>(5)
  }

  ngOnInit() {
    this.insertActivities()
    if (this.route.snapshot.data['readOnly'])
      this.activitiesFormGroup.disable()

    this.activitiesForm.emit(this.activitiesFormGroup)
  }

  insertActivities() {
    var activitiesFormArray = (this.activitiesFormGroup.get('activities') as FormArray).controls
    var activitiesModelArray = this.npi.activities

    activitiesModelArray.forEach(activity => {
      var activitiesControl = this.fb.group(
        {
          _id: activity._id,
          date: activity.date,
          registry: activity.registry,
          annex: activity.annex
          //signature: activity.signature 
        }
      )
      activitiesFormArray.push(activitiesControl)
    });
  }
}
