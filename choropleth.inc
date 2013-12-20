<?php

/**
 * @file
 * Non-hook implementations for the Choropleth module.
 */

/**
 * Returns a simple csv with states mapped to GeoJson shapes.
 */
function choropleth_usstates_geojson() {

  $filename = 'states.json';
  $filepath = __DIR__ . '/' . $filename;
  $file_contents = json_decode(file_get_contents($filepath));
  $state_geometry = $file_contents;

  $state_abbreviations = array_flip(choropleth_get_usstate_abbr());
  $state_geojson = array();
  foreach ($state_geometry->features as $state) {
    $state_name = $state->properties->name;
    if (!empty($state_abbreviations[$state_name])) {
      $state_abbreviation = $state_abbreviations[$state_name];
      $state_geojson[$state_abbreviation] = array(
        'name' => $state_name,
        'geojson' => json_encode($state->geometry),
      );
    }
  }

  // Add the headers needed to let the browser know this is a csv file download.
  drupal_add_http_header('Content-Type', 'text/csv; utf-8');
  drupal_add_http_header('Content-Disposition', 'attachment; filename = usstates_geojson.csv');

  // Instead of writing to a file, we write to the output stream.
  $fh = fopen('php://output', 'w');

  // Add a header row
  fputcsv($fh, array(t('State'), t('Geometry')));

  // Loop through rows and write the csv data.
  foreach($state_geojson as $line) {
    fputcsv($fh, $line);
  }

  // Close the output stream.
  fclose($fh);

}

/**
 * Returns an associative array of US state mapped to full names.
 *
 * @return array
 */
function choropleth_get_usstate_abbr() {
  return array(
    'AL'=>'Alabama',
    'AK'=>'Alaska',
    'AZ'=>'Arizona',
    'AR'=>'Arkansas',
    'CA'=>'California',
    'CO'=>'Colorado',
    'CT'=>'Connecticut',
    'DE'=>'Delaware',
    'DC'=>'District of Columbia',
    'FL'=>'Florida',
    'GA'=>'Georgia',
    'HI'=>'Hawaii',
    'ID'=>'Idaho',
    'IL'=>'Illinois',
    'IN'=>'Indiana',
    'IA'=>'Iowa',
    'KS'=>'Kansas',
    'KY'=>'Kentucky',
    'LA'=>'Louisiana',
    'ME'=>'Maine',
    'MD'=>'Maryland',
    'MA'=>'Massachusetts',
    'MI'=>'Michigan',
    'MN'=>'Minnesota',
    'MS'=>'Mississippi',
    'MO'=>'Missouri',
    'MT'=>'Montana',
    'NE'=>'Nebraska',
    'NV'=>'Nevada',
    'NH'=>'New Hampshire',
    'NJ'=>'New Jersey',
    'NM'=>'New Mexico',
    'NY'=>'New York',
    'NC'=>'North Carolina',
    'ND'=>'North Dakota',
    'OH'=>'Ohio',
    'OK'=>'Oklahoma',
    'OR'=>'Oregon',
    'PA'=>'Pennsylvania',
    'RI'=>'Rhode Island',
    'SC'=>'South Carolina',
    'SD'=>'South Dakota',
    'TN'=>'Tennessee',
    'TX'=>'Texas',
    'UT'=>'Utah',
    'VT'=>'Vermont',
    'VA'=>'Virginia',
    'WA'=>'Washington',
    'WV'=>'West Virginia',
    'WI'=>'Wisconsin',
    'WY'=>'Wyoming',
  );
}
