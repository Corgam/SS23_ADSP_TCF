import { Component } from '@angular/core';
import { DataType, Datafile, MediaType, NotRefDataFile, Ref, RefDataFile } from '../../../../../common/types/datafile';

interface ResultCollection {
  title: string,
  results: RefDataFile[]
}

@Component({
  selector: 'app-gallery-view',
  templateUrl: './gallery-view.component.html',
  styleUrls: ['./gallery-view.component.scss']
})
export class GalleryViewComponent {

  panelOpenState = false;

  dataSource : ResultCollection[] = [];
  width = 300;

  berDatafiles: RefDataFile[];
  txlDatafiles: RefDataFile[];
  berAirport: Datafile = {
      title: "BER Airport",
      tags: [
        "SimRa", "BER"
      ],
      dataSet: "NONE",
      dataType: DataType.REFERENCED,
      content: {
        url: "https://upload.wikimedia.org/wikipedia/commons/d/df/Airport_berlin_BER_2019.jpg",
        mediaType: MediaType.PHOTO,
        location: {
          type: "Point",
          coordinates: [
            13.513070157939701,
            52.36602945386389
          ]
        }
      }
  }

  berTower: Datafile = {
    title: "BER Airport",
    tags: [
      "SimRa", "BER"
    ],
    dataSet: "NONE",
    dataType: DataType.REFERENCED,
    content: {
      url: "https://upload.wikimedia.org/wikipedia/commons/3/36/Berlin_brandenburg_airport_tower.jpg",
      mediaType: MediaType.PHOTO,
      location: {
        type: "Point",
        coordinates: [
          13.513070157939701,
          52.36602945386389
        ]
      }
    }
}




  txlAirport: Datafile = {
    title: "Tegel Airport",
    tags: [
      "TXL"
    ],
    dataSet: "NONE",
    dataType: DataType.REFERENCED,
    content: {
      url: "https://upload.wikimedia.org/wikipedia/commons/6/6c/Flughafen_Tegel_Tower_und_Hauptgeb%C3%A4ude.jpg",
      mediaType: MediaType.PHOTO,
      location: {
        type: "Point",
        coordinates: [
          13.291167293398054,
          52.55362907675118
        ]
      }
    }
  };


  videos: RefDataFile[] = [{
    title: "Tegel Airport Youtube",
    tags: [
      "TXL"
    ],
    dataSet: "NONE",
    dataType: DataType.REFERENCED,
    content: {
      url: "https://www.youtube.com/watch?v=rCVoYTTsFjI&ab_channel=DWEuromaxx",
      mediaType: MediaType.VIDEO,
      location: {
        type: "Point",
        coordinates: [
          13.291167293398054,
          52.55362907675118
        ]
      }
    }
  },
  {
    title: "Tegel Airport Youtube",
    tags: [
      "TXL"
    ],
    dataSet: "NONE",
    dataType: DataType.REFERENCED,
    content: {
      url: "https://youtu.be/xEmLjj7nXQw",
      mediaType: MediaType.VIDEO,
      location: {
        type: "Point",
        coordinates: [
          13.291167293398054,
          52.55362907675118
        ]
      }
    }
  },

  {
    title: "Tegel Airport Not-Youtube",
    tags: [
      "TXL"
    ],
    dataSet: "NONE",
    dataType: DataType.REFERENCED,
    content: {
      url: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_10mb.mp4",
      mediaType: MediaType.VIDEO,
      location: {
        type: "Point",
        coordinates: [
          13.291167293398054,
          52.55362907675118
        ]
      }
    }
  },
  {
    title: "Nationalhymne",
    tags: [
      "TXL"
    ],
    dataSet: "NONE",
    dataType: DataType.REFERENCED,
    content: {
      url: "https://upload.wikimedia.org/wikipedia/commons/c/cb/National_anthem_of_Germany_-_U.S._Army_1st_Armored_Division_Band.ogg",
      mediaType: MediaType.SOUNDFILE,
      location: {
        type: "Point",
        coordinates: [
          13.291167293398054,
          52.55362907675118
        ]
      }
    }
  }
]

  constructor() {
    this.berDatafiles = [this.berAirport, this.berTower, this.berAirport, this.berAirport, this.berAirport, this.berAirport, this.berAirport, this.berTower].filter(d => d.dataType === DataType.REFERENCED).map(d => d as RefDataFile);
    this.txlDatafiles = [this.txlAirport, this.txlAirport, this.txlAirport, this.txlAirport, this.txlAirport, this.txlAirport].filter(d => d.dataType === DataType.REFERENCED).map(d => d as RefDataFile);
    // datafiles.filter(d => d.dataType === DataType.REFERENCED)
    //   .map<GalleryList>(d => ({id: d._id!, url: (d.content as Ref).url, mediaType: (d.content as Ref).mediaType }));



    this.dataSource = [
      {
      title: "BER",
      results: this.berDatafiles
    },
    {
      title: "TXL",
      results: this.txlDatafiles
    },
    {
      title: "Multimedia stuff",
      results: this.videos
    },
  ]
  }
}
